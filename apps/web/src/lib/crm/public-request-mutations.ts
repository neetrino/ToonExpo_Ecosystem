import { publicRequestInputSchema, type PublicRequestInput } from '@toonexpo/contracts';
import { prisma, type Prisma } from '@toonexpo/db';
import type { ApartmentStatus, RequestSource } from '@toonexpo/domain';

import { DEDUP_RECENCY_WINDOW_HOURS, OPEN_DEAL_STAGES } from './constants';
import { buildDealApartmentSnapshotData } from './deal-apartment-snapshot';
import type { PublicRequestMutationResult } from './mutation-result';

const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;

type TransactionClient = Omit<
  typeof prisma,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

type ResolvedProject = {
  id: string;
  companyId: string;
};

export type SubmitPublicRequestParams = PublicRequestInput & {
  buyerUserId?: string;
};

function dedupWindowStart(): Date {
  return new Date(Date.now() - DEDUP_RECENCY_WINDOW_HOURS * MILLISECONDS_PER_HOUR);
}

function resolveSource(apartmentId: string | undefined): RequestSource {
  return apartmentId ? 'APARTMENT_PAGE' : 'PROJECT_PAGE';
}

function buildIdentityFilter(
  buyerUserId: string | undefined,
  email: string,
  phone: string,
): Prisma.DealWhereInput {
  if (buyerUserId) {
    return { buyerUserId };
  }
  return { OR: [{ contactEmail: email }, { contactPhone: phone }] };
}

function buildDedupWhere(
  companyId: string,
  projectId: string,
  identity: Prisma.DealWhereInput,
  apartmentId?: string,
): Prisma.DealWhereInput {
  const base: Prisma.DealWhereInput = {
    companyId,
    projectId,
    stage: { in: [...OPEN_DEAL_STAGES] },
    createdAt: { gte: dedupWindowStart() },
    ...identity,
  };

  if (!apartmentId) {
    return base;
  }

  return {
    ...base,
    apartments: { some: { apartmentId } },
  };
}

async function resolvePublishedProject(
  tx: TransactionClient,
  input: PublicRequestInput,
): Promise<ResolvedProject | null> {
  const projectId = input.projectId;
  if (!projectId) {
    return null;
  }

  const project = await tx.project.findFirst({
    where: { id: projectId, status: 'PUBLISHED' },
    select: { id: true, companyId: true },
  });

  return project;
}

async function fetchApartmentInProject(
  tx: TransactionClient,
  apartmentId: string,
  projectId: string,
): Promise<{ id: string; priceAmd: number | null; status: ApartmentStatus } | null> {
  return tx.apartment.findFirst({
    where: {
      id: apartmentId,
      floor: { building: { projectId } },
    },
    select: { id: true, priceAmd: true, status: true },
  });
}

function activityBody(message: string | undefined, source: RequestSource): string {
  if (message) {
    return message;
  }
  return source === 'APARTMENT_PAGE'
    ? 'Repeated interest from apartment page.'
    : 'Repeated interest from project page.';
}

async function appendDedupActivity(
  tx: TransactionClient,
  dealId: string,
  message: string | undefined,
  source: RequestSource,
  authorUserId?: string,
): Promise<void> {
  const now = new Date();
  await tx.dealActivity.create({
    data: {
      dealId,
      authorUserId,
      type: 'COMMENT',
      body: activityBody(message, source),
    },
  });
  await tx.deal.update({
    where: { id: dealId },
    data: { lastActivityAt: now },
  });
}

async function createDealWithActivity(
  tx: TransactionClient,
  params: {
    companyId: string;
    projectId: string;
    source: RequestSource;
    name: string;
    phone: string;
    email: string;
    message?: string;
    apartmentId?: string;
    apartmentSnapshot?: { priceAmd: number | null; status: ApartmentStatus };
    buyerUserId?: string;
    authorUserId?: string;
  },
): Promise<string> {
  const now = new Date();
  const deal = await tx.deal.create({
    data: {
      companyId: params.companyId,
      projectId: params.projectId,
      stage: 'NEW_REQUEST',
      source: params.source,
      buyerUserId: params.buyerUserId,
      contactName: params.name,
      contactPhone: params.phone,
      contactEmail: params.email,
      message: params.message,
      lastActivityAt: now,
      apartments:
        params.apartmentId && params.apartmentSnapshot
          ? {
              create: {
                apartmentId: params.apartmentId,
                ...buildDealApartmentSnapshotData(params.apartmentSnapshot),
              },
            }
          : undefined,
      activities: {
        create: {
          authorUserId: params.authorUserId,
          type: 'COMMENT',
          body: params.message ?? 'Inbound request from public catalog.',
        },
      },
    },
    select: { id: true },
  });

  return deal.id;
}

/**
 * Creates or deduplicates a public catalog request as a CRM deal.
 * v1 does not retroactively link anonymous requests when the buyer later registers.
 */
export async function submitPublicRequest(
  raw: SubmitPublicRequestParams,
): Promise<PublicRequestMutationResult> {
  const parsed = publicRequestInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, errorKey: 'invalidInput' };
  }

  const input = parsed.data;
  const source = resolveSource(input.apartmentId);

  const result = await prisma.$transaction(async (tx) => {
    const project = await resolvePublishedProject(tx, input);
    if (!project) {
      return { ok: false as const, errorKey: 'notFound' as const };
    }

    let apartmentSnapshot: { priceAmd: number | null; status: ApartmentStatus } | undefined;
    if (input.apartmentId) {
      const apartment = await fetchApartmentInProject(tx, input.apartmentId, project.id);
      if (!apartment) {
        return { ok: false as const, errorKey: 'invalidInput' as const };
      }
      apartmentSnapshot = { priceAmd: apartment.priceAmd, status: apartment.status };
    }

    const identity = buildIdentityFilter(raw.buyerUserId, input.email, input.phone);
    const existing = await tx.deal.findFirst({
      where: buildDedupWhere(project.companyId, project.id, identity, input.apartmentId),
      select: { id: true },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      await appendDedupActivity(tx, existing.id, input.message, source, raw.buyerUserId);
      return {
        ok: true as const,
        deduped: true as const,
        dealId: existing.id,
      };
    }

    const dealId = await createDealWithActivity(tx, {
      companyId: project.companyId,
      projectId: project.id,
      source,
      name: input.name,
      phone: input.phone,
      email: input.email,
      message: input.message,
      apartmentId: input.apartmentId,
      apartmentSnapshot,
      buyerUserId: raw.buyerUserId,
      authorUserId: raw.buyerUserId,
    });

    return {
      ok: true as const,
      dealId,
    };
  });

  if (!result.ok) {
    return result;
  }

  if ('deduped' in result && result.deduped) {
    return { ok: true, deduped: true, dealId: result.dealId };
  }

  return { ok: true, dealId: result.dealId };
}
