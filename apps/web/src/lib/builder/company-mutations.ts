import type { CompanyProfileUpdateInput } from '@toonexpo/contracts';
import { prisma } from '@toonexpo/db';

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
  const result = await prisma.company.updateMany({
    where: { id: companyId },
    data: toCompanyProfileWriteData(input),
  });

  if (result.count === 0) {
    return { ok: false, errorKey: 'notFound' };
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { slug: true },
  });

  if (!company) {
    return { ok: false, errorKey: 'notFound' };
  }

  return { ok: true, companyId, companySlug: company.slug };
}
