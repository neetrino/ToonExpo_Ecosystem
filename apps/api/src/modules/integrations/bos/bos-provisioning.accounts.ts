import { slugifyCompanyName, type BosProvisioningRequest } from '@toonexpo/contracts';
import { type Prisma, type PartnerType, type PlatformRole } from '@toonexpo/db';
import type { BosCompanyType } from '@toonexpo/domain';

import { allocateUniqueSlug } from './bos-provisioning.crypto';

type Tx = Prisma.TransactionClient;

export function mapRole(companyType: BosCompanyType): PlatformRole {
  return companyType === 'builder' ? 'BUILDER' : 'PARTNER';
}

export function mapPartnerType(input: BosProvisioningRequest): PartnerType {
  if (input.companyType === 'bank') {
    return 'BANK';
  }
  return input.partnerType ?? 'OTHER';
}

export function needsPartnerProfile(companyType: BosCompanyType): boolean {
  return companyType === 'partner' || companyType === 'bank';
}

/**
 * Reuse an existing company by exact name (one query), otherwise allocate a
 * unique slug. Avoids probing up to MAX_SLUG_ATTEMPTS slug variants inside the
 * BOS claim transaction (that path previously burned ~50 RTTs and hit the
 * Prisma interactive-tx timeout under Neon latency).
 */
export async function resolveCompanyId(tx: Tx, companyName: string): Promise<string> {
  const existing = await tx.company.findFirst({
    where: { name: companyName },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });
  if (existing) {
    return existing.id;
  }

  const baseSlug = slugifyCompanyName(companyName);
  const slug = await allocateUniqueSlug(baseSlug, async (candidate) => {
    const row = await tx.company.findUnique({ where: { slug: candidate } });
    return row !== null;
  });
  if (!slug) {
    throw new Error('Unable to allocate company slug');
  }
  const created = await tx.company.create({ data: { name: companyName, slug } });
  return created.id;
}

export async function ensurePartner(
  tx: Tx,
  input: BosProvisioningRequest,
  companyId: string,
): Promise<void> {
  const existing = await tx.partner.findUnique({ where: { companyId } });
  if (existing) {
    return;
  }
  const baseSlug = slugifyCompanyName(input.companyName);
  const slug = await allocateUniqueSlug(baseSlug, async (candidate) => {
    const row = await tx.partner.findUnique({ where: { slug: candidate } });
    return row !== null;
  });
  if (!slug) {
    throw new Error('Unable to allocate partner slug');
  }
  await tx.partner.create({
    data: {
      name: input.companyName,
      slug,
      type: mapPartnerType(input),
      email: input.primaryContactEmail.toLowerCase(),
      phone: input.primaryContactPhone ?? null,
      companyId,
      status: 'DRAFT',
    },
  });
}
