import type { CompanyProfileUpdateInput } from '@toonexpo/contracts';
import { prisma } from '@toonexpo/db';

import { bestEffortDeleteReplacedR2Object } from '@/lib/storage';

import { type BuilderMutationResult } from './mutation-result';

function toCompanyProfileWriteData(input: CompanyProfileUpdateInput) {
  return {
    name: input.name,
    description: input.description ?? null,
    logoUrl: input.logoUrl ?? null,
    phone: input.phone ?? null,
    email: input.email ?? null,
    website: input.website ?? null,
    city: input.city ?? null,
    address: input.address ?? null,
  };
}

/** Updates profile fields for the builder's own company. */
export async function updateCompanyProfile(
  companyId: string,
  input: CompanyProfileUpdateInput,
): Promise<BuilderMutationResult<{ companyId: string; companySlug: string }>> {
  const existing = await prisma.company.findUnique({
    where: { id: companyId },
    select: { logoUrl: true, slug: true },
  });

  if (!existing) {
    return { ok: false, errorKey: 'notFound' };
  }

  const result = await prisma.company.updateMany({
    where: { id: companyId },
    data: toCompanyProfileWriteData(input),
  });

  if (result.count === 0) {
    return { ok: false, errorKey: 'notFound' };
  }

  await bestEffortDeleteReplacedR2Object(existing.logoUrl, input.logoUrl ?? null);

  return { ok: true, companyId, companySlug: existing.slug };
}
