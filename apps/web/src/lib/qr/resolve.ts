import { prisma } from '@toonexpo/db';
import type { PlatformRole } from '@toonexpo/domain';

import { hashQrToken } from './token';

export type BuyerContactSnapshot = {
  userId: string;
  name: string | null;
  email: string;
  phone: string | null;
};

/** Entrance staff may see display name only — no phone/email (docs 04). */
export type EntranceBuyerSnapshot = {
  userId: string;
  name: string | null;
};

export type BuilderProjectOption = {
  id: string;
  name: string;
};

export type QrResolveInvalid = { kind: 'invalid' };

export type QrResolveOwner = { kind: 'owner'; qrCodeId: string };

export type QrResolveBuilder = {
  kind: 'builder';
  qrCodeId: string;
  buyer: BuyerContactSnapshot;
  projects: BuilderProjectOption[];
};

export type QrResolveEntrance = {
  kind: 'entrance';
  qrCodeId: string;
  buyer: EntranceBuyerSnapshot;
};

/** Valid QR, no PII — anonymous / partner / other non-privileged roles. */
export type QrResolveLimited = { kind: 'limited'; qrCodeId: string };

export type QrResolveResult =
  | QrResolveInvalid
  | QrResolveOwner
  | QrResolveBuilder
  | QrResolveEntrance
  | QrResolveLimited;

type SessionContext = {
  userId?: string;
  role?: PlatformRole;
  companyId?: string;
};

type ActiveQrRow = {
  id: string;
  buyerProfile: {
    userId: string;
  };
};

async function findActiveQrByToken(token: string): Promise<ActiveQrRow | null> {
  const tokenHash = hashQrToken(token);
  const row = await prisma.qrCode.findFirst({
    where: { tokenHash, revokedAt: null },
    select: {
      id: true,
      buyerProfile: { select: { userId: true } },
    },
  });
  return row;
}

async function loadBuyerContact(userId: string): Promise<BuyerContactSnapshot | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, phone: true },
  });
  if (!user) {
    return null;
  }
  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
  };
}

/** Query-level narrowing: name only — never select phone/email for entrance. */
async function loadEntranceBuyer(userId: string): Promise<EntranceBuyerSnapshot | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true },
  });
  if (!user) {
    return null;
  }
  return { userId: user.id, name: user.name };
}

async function loadCompanyProjects(companyId: string): Promise<BuilderProjectOption[]> {
  return prisma.project.findMany({
    where: { companyId, status: { in: ['PUBLISHED', 'DRAFT'] } },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
}

/**
 * Resolves a QR token into a role-narrowed view.
 * Revoked and unknown tokens both map to `invalid` (no enumeration).
 */
export async function resolveQrScan(
  token: string,
  session: SessionContext,
): Promise<QrResolveResult> {
  if (!token.trim()) {
    return { kind: 'invalid' };
  }

  const qr = await findActiveQrByToken(token);
  if (!qr) {
    return { kind: 'invalid' };
  }

  if (session.userId && session.userId === qr.buyerProfile.userId) {
    return { kind: 'owner', qrCodeId: qr.id };
  }

  if (session.role === 'BUILDER' && session.companyId) {
    const [buyer, projects] = await Promise.all([
      loadBuyerContact(qr.buyerProfile.userId),
      loadCompanyProjects(session.companyId),
    ]);
    if (!buyer) {
      return { kind: 'invalid' };
    }
    return {
      kind: 'builder',
      qrCodeId: qr.id,
      buyer,
      projects,
    };
  }

  if (session.role === 'ENTRANCE_STAFF') {
    const buyer = await loadEntranceBuyer(qr.buyerProfile.userId);
    if (!buyer) {
      return { kind: 'invalid' };
    }
    return { kind: 'entrance', qrCodeId: qr.id, buyer };
  }

  return { kind: 'limited', qrCodeId: qr.id };
}

/** Public shape helpers for tests — strips PII for non-builder branches. */
export function toPublicResolveShape(result: QrResolveResult): {
  kind: QrResolveResult['kind'];
  hasBuyerPii: boolean;
  hasContactPii: boolean;
} {
  if (result.kind === 'builder') {
    return { kind: 'builder', hasBuyerPii: true, hasContactPii: true };
  }
  if (result.kind === 'entrance') {
    return { kind: 'entrance', hasBuyerPii: true, hasContactPii: false };
  }
  return { kind: result.kind, hasBuyerPii: false, hasContactPii: false };
}
