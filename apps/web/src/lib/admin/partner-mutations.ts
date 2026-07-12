import type {
  BankOfferStatusInput,
  BankOfferUpsertInput,
  PartnerStatusInput,
  PartnerUpsertInput,
} from '@toonexpo/contracts';
import { slugifyCompanyName } from '@toonexpo/contracts';
import { prisma, Prisma } from '@toonexpo/db';

import { type AuditActor, formatStatusTransition, recordAudit } from '@/lib/audit/record-audit';
import { allocateUniqueSlug } from '@/lib/shared/unique-slug';

import { type AdminMutationResult, UNIQUE_CONSTRAINT_ERROR } from './mutation-result';

type PartnerWriteData = {
  name: string;
  type: PartnerUpsertInput['type'];
  logoUrl: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  serviceCategories: string[];
};

function toPartnerWriteData(input: PartnerUpsertInput): PartnerWriteData {
  return {
    name: input.name,
    type: input.type,
    logoUrl: input.logoUrl ?? null,
    description: input.description ?? null,
    phone: input.phone ?? null,
    email: input.email ?? null,
    website: input.website ?? null,
    serviceCategories: input.serviceCategories ?? [],
  };
}

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === UNIQUE_CONSTRAINT_ERROR
  );
}

export async function createPartner(
  input: PartnerUpsertInput,
): Promise<AdminMutationResult<{ partnerId: string; partnerSlug: string }>> {
  const baseSlug = slugifyCompanyName(input.name);
  const data = toPartnerWriteData(input);

  try {
    const slug = await allocateUniqueSlug(baseSlug, async (candidate) => {
      const existing = await prisma.partner.findUnique({ where: { slug: candidate } });
      return existing !== null;
    });

    if (!slug) {
      return { ok: false, errorKey: 'invalidInput' };
    }

    const partner = await prisma.partner.create({
      data: { ...data, slug },
      select: { id: true, slug: true },
    });

    return { ok: true, partnerId: partner.id, partnerSlug: partner.slug };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, errorKey: 'nameTaken' };
    }
    throw error;
  }
}

export async function updatePartner(
  input: PartnerUpsertInput & { partnerId: string },
): Promise<AdminMutationResult<{ partnerId: string; partnerSlug: string }>> {
  const data = toPartnerWriteData(input);

  try {
    const existing = await prisma.partner.findUnique({
      where: { id: input.partnerId },
      select: { id: true, slug: true },
    });
    if (!existing) {
      return { ok: false, errorKey: 'notFound' };
    }

    await prisma.partner.update({
      where: { id: input.partnerId },
      data,
    });

    return { ok: true, partnerId: existing.id, partnerSlug: existing.slug };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, errorKey: 'nameTaken' };
    }
    throw error;
  }
}

/** Partner status change — audit written inside the same transaction (atomic). */
export async function setPartnerStatus(
  input: PartnerStatusInput,
  actor: AuditActor,
): Promise<AdminMutationResult<{ partnerId: string; partnerSlug: string }>> {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.partner.findUnique({
      where: { id: input.partnerId },
      select: { id: true, slug: true, status: true, companyId: true },
    });
    if (!existing) {
      return { ok: false, errorKey: 'notFound' };
    }

    await tx.partner.update({
      where: { id: input.partnerId },
      data: { status: input.status },
    });

    await recordAudit(tx, {
      actor,
      action: 'PUBLICATION_CHANGE',
      entityType: 'PARTNER',
      entityId: existing.id,
      companyId: existing.companyId,
      detail: formatStatusTransition(existing.status, input.status),
    });

    return { ok: true, partnerId: existing.id, partnerSlug: existing.slug };
  });
}

async function assertBankPartner(
  partnerId: string,
): Promise<AdminMutationResult<{ partnerId: string }>> {
  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
    select: { id: true, type: true },
  });

  if (!partner) {
    return { ok: false, errorKey: 'notFound' };
  }
  if (partner.type !== 'BANK') {
    return { ok: false, errorKey: 'notBankPartner' };
  }
  return { ok: true, partnerId: partner.id };
}

type BankOfferWriteData = {
  title: string;
  description: string | null;
  interestRate: number;
  minDownPaymentPercent: number;
  maxTermMonths: number;
  maxAmountAmd: number | null;
  featured: boolean;
};

function toBankOfferWriteData(input: BankOfferUpsertInput): BankOfferWriteData {
  return {
    title: input.title,
    description: input.description ?? null,
    interestRate: input.interestRate,
    minDownPaymentPercent: input.minDownPaymentPercent,
    maxTermMonths: input.maxTermMonths,
    maxAmountAmd: input.maxAmountAmd ?? null,
    featured: input.featured ?? false,
  };
}

async function partnerSlugById(partnerId: string): Promise<string | null> {
  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
    select: { slug: true },
  });
  return partner?.slug ?? null;
}

export async function createBankOffer(
  input: BankOfferUpsertInput,
): Promise<AdminMutationResult<{ bankOfferId: string; partnerSlug: string }>> {
  const bankCheck = await assertBankPartner(input.partnerId);
  if (!bankCheck.ok) {
    return bankCheck;
  }

  const partnerSlug = await partnerSlugById(input.partnerId);
  if (!partnerSlug) {
    return { ok: false, errorKey: 'notFound' };
  }

  const offer = await prisma.bankOffer.create({
    data: {
      partnerId: input.partnerId,
      ...toBankOfferWriteData(input),
    },
    select: { id: true },
  });

  return { ok: true, bankOfferId: offer.id, partnerSlug };
}

export async function updateBankOffer(
  input: BankOfferUpsertInput & { bankOfferId: string },
): Promise<AdminMutationResult<{ bankOfferId: string; partnerSlug: string }>> {
  const bankCheck = await assertBankPartner(input.partnerId);
  if (!bankCheck.ok) {
    return bankCheck;
  }

  const result = await prisma.bankOffer.updateMany({
    where: { id: input.bankOfferId, partnerId: input.partnerId },
    data: toBankOfferWriteData(input),
  });

  if (result.count === 0) {
    return { ok: false, errorKey: 'notFound' };
  }

  const partnerSlug = await partnerSlugById(input.partnerId);
  if (!partnerSlug) {
    return { ok: false, errorKey: 'notFound' };
  }

  return { ok: true, bankOfferId: input.bankOfferId, partnerSlug };
}

/** Bank offer status change — audit written inside the same transaction (atomic). */
export async function setBankOfferStatus(
  input: BankOfferStatusInput,
  actor: AuditActor,
): Promise<AdminMutationResult<{ bankOfferId: string; partnerSlug: string }>> {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.bankOffer.findUnique({
      where: { id: input.bankOfferId },
      select: {
        id: true,
        status: true,
        partner: { select: { type: true, slug: true, companyId: true } },
      },
    });

    if (!existing) {
      return { ok: false, errorKey: 'notFound' };
    }
    if (existing.partner.type !== 'BANK') {
      return { ok: false, errorKey: 'notBankPartner' };
    }

    await tx.bankOffer.update({
      where: { id: input.bankOfferId },
      data: { status: input.status },
    });

    await recordAudit(tx, {
      actor,
      action: 'PUBLICATION_CHANGE',
      entityType: 'BANK_OFFER',
      entityId: existing.id,
      companyId: existing.partner.companyId,
      detail: formatStatusTransition(existing.status, input.status),
    });

    return { ok: true, bankOfferId: input.bankOfferId, partnerSlug: existing.partner.slug };
  });
}
