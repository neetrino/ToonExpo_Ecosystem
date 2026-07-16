import { builderQrScanDealInputSchema, type BuilderQrScanDealInput } from '@toonexpo/contracts';
import { prisma, type Prisma } from '@toonexpo/db';

import { DEDUP_RECENCY_WINDOW_HOURS, OPEN_DEAL_STAGES } from '../crm/constants';

import type { QrScanDealMutationResult } from './mutation-result';
import { hashQrToken } from './token';

const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;
const MILLISECONDS_PER_MINUTE = 60 * 1000;
const BUILDER_SCAN_LOG_DEBOUNCE_MINUTES = 5;
const BUILDER_SCAN_LOG_DEBOUNCE_MS = BUILDER_SCAN_LOG_DEBOUNCE_MINUTES * MILLISECONDS_PER_MINUTE;
const SCAN_SOURCE = 'BUILDER_QR_SCAN' as const;
const DEFAULT_ACTIVITY_BODY = 'Lead created from builder QR scan.';
const DEDUP_ACTIVITY_BODY = 'Repeated QR scan interest recorded.';

type TransactionClient = Omit<
  typeof prisma,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export type CreateScanDealParams = BuilderQrScanDealInput & {
  builderUserId: string;
  companyId: string;
};

function dedupWindowStart(): Date {
  return new Date(Date.now() - DEDUP_RECENCY_WINDOW_HOURS * MILLISECONDS_PER_HOUR);
}

function buildDedupWhere(
  companyId: string,
  buyerUserId: string,
  projectId: string | undefined,
): Prisma.DealWhereInput {
  return {
    companyId,
    buyerUserId,
    projectId: projectId ?? null,
    stage: { in: [...OPEN_DEAL_STAGES] },
    createdAt: { gte: dedupWindowStart() },
  };
}

async function resolveActiveQrBuyer(
  tx: TransactionClient,
  token: string,
): Promise<{
  qrCodeId: string;
  buyerUserId: string;
  name: string;
  phone: string;
  email: string;
} | null> {
  const tokenHash = hashQrToken(token);
  const qr = await tx.qrCode.findFirst({
    where: { tokenHash, revokedAt: null },
    select: {
      id: true,
      buyerProfile: {
        select: {
          user: { select: { id: true, name: true, phone: true, email: true } },
        },
      },
    },
  });

  if (!qr) {
    return null;
  }

  const user = qr.buyerProfile.user;
  return {
    qrCodeId: qr.id,
    buyerUserId: user.id,
    name: user.name?.trim() || user.email,
    phone: user.phone?.trim() || '—',
    email: user.email,
  };
}

async function verifyCompanyProject(
  tx: TransactionClient,
  projectId: string,
  companyId: string,
): Promise<boolean> {
  const project = await tx.project.findFirst({
    where: { id: projectId, companyId },
    select: { id: true },
  });
  return project !== null;
}

async function appendDedupActivity(
  tx: TransactionClient,
  dealId: string,
  note: string | undefined,
  authorUserId: string,
): Promise<void> {
  const now = new Date();
  await tx.dealActivity.create({
    data: {
      dealId,
      authorUserId,
      type: 'COMMENT',
      body: note ?? DEDUP_ACTIVITY_BODY,
    },
  });
  await tx.deal.update({
    where: { id: dealId },
    data: { lastActivityAt: now },
  });
}

async function createScanDealRow(
  tx: TransactionClient,
  params: {
    companyId: string;
    projectId?: string;
    buyerUserId: string;
    createdByUserId: string;
    name: string;
    phone: string;
    email: string;
    note?: string;
  },
): Promise<string> {
  const now = new Date();
  const deal = await tx.deal.create({
    data: {
      companyId: params.companyId,
      projectId: params.projectId,
      stage: 'NEW_REQUEST',
      source: SCAN_SOURCE,
      buyerUserId: params.buyerUserId,
      createdByUserId: params.createdByUserId,
      contactName: params.name,
      contactPhone: params.phone,
      contactEmail: params.email,
      message: params.note,
      lastActivityAt: now,
      activities: {
        create: {
          authorUserId: params.createdByUserId,
          type: 'COMMENT',
          body: params.note ?? DEFAULT_ACTIVITY_BODY,
        },
      },
    },
    select: { id: true },
  });
  return deal.id;
}

async function runScanDealTransaction(
  tx: TransactionClient,
  raw: CreateScanDealParams,
  input: BuilderQrScanDealInput,
): Promise<QrScanDealMutationResult> {
  const buyer = await resolveActiveQrBuyer(tx, input.qrToken);
  if (!buyer) {
    return { ok: false, errorKey: 'notFound' };
  }
  if (buyer.buyerUserId === raw.builderUserId) {
    return { ok: false, errorKey: 'invalidInput' };
  }
  if (input.projectId) {
    const owned = await verifyCompanyProject(tx, input.projectId, raw.companyId);
    if (!owned) {
      return { ok: false, errorKey: 'invalidInput' };
    }
  }

  const existing = await tx.deal.findFirst({
    where: buildDedupWhere(raw.companyId, buyer.buyerUserId, input.projectId),
    select: { id: true },
    orderBy: { createdAt: 'desc' },
  });
  if (existing) {
    await appendDedupActivity(tx, existing.id, input.note, raw.builderUserId);
    return { ok: true, deduped: true, dealId: existing.id };
  }

  const dealId = await createScanDealRow(tx, {
    companyId: raw.companyId,
    projectId: input.projectId,
    buyerUserId: buyer.buyerUserId,
    createdByUserId: raw.builderUserId,
    name: buyer.name,
    phone: buyer.phone,
    email: buyer.email,
    note: input.note,
  });
  return { ok: true, dealId };
}

/**
 * Creates or deduplicates a CRM deal from a builder QR scan.
 * Reuses the open-deal + recency window pattern from public requests.
 * Scan logging happens on the builder action page open (not here) so a
 * close-without-action still leaves a technical BUILDER_SCAN row.
 */
export async function createDealFromQrScan(
  raw: CreateScanDealParams,
): Promise<QrScanDealMutationResult> {
  const parsed = builderQrScanDealInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, errorKey: 'invalidInput' };
  }

  return prisma.$transaction((tx) => runScanDealTransaction(tx, raw, parsed.data));
}

/**
 * Records a builder scan without creating a deal (page open / close without action).
 * Anonymous scanners are not logged: QrScanLog.scannedByUserId is required and
 * anonymous logging would spam UNKNOWN rows (03-Buyer-History: technical logs
 * are internal; we only write authenticated builder scans in v1).
 */
export async function logBuilderQrScan(params: {
  qrCodeId: string;
  scannedByUserId: string;
  companyId: string;
}): Promise<void> {
  const since = new Date(Date.now() - BUILDER_SCAN_LOG_DEBOUNCE_MS);
  const recent = await prisma.qrScanLog.findFirst({
    where: {
      qrCodeId: params.qrCodeId,
      scannedByUserId: params.scannedByUserId,
      purpose: 'BUILDER_SCAN',
      scannedAt: { gte: since },
    },
    select: { id: true },
  });
  if (recent) {
    return;
  }

  await prisma.qrScanLog.create({
    data: {
      qrCodeId: params.qrCodeId,
      scannedByUserId: params.scannedByUserId,
      companyId: params.companyId,
      purpose: 'BUILDER_SCAN',
    },
  });
}
