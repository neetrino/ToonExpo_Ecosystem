import type { CompanyProfileUpdateInput, CompanyUpsertInput } from '@toonexpo/contracts';
import { slugifyCompanyName } from '@toonexpo/contracts';
import { prisma, Prisma } from '@toonexpo/db';

import { allocateUniqueSlug } from '@/lib/shared/unique-slug';

import { type AdminMutationResult, UNIQUE_CONSTRAINT_ERROR } from './mutation-result';

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

export async function createCompany(
  input: CompanyUpsertInput,
): Promise<AdminMutationResult<{ companyId: string }>> {
  const baseSlug = slugifyCompanyName(input.name);

  try {
    const slug = await allocateUniqueSlug(baseSlug, async (candidate) => {
      const existing = await prisma.company.findUnique({ where: { slug: candidate } });
      return existing !== null;
    });

    if (!slug) {
      return { ok: false, errorKey: 'invalidInput' };
    }

    const company = await prisma.company.create({
      data: { name: input.name, slug },
      select: { id: true },
    });

    return { ok: true, companyId: company.id };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === UNIQUE_CONSTRAINT_ERROR
    ) {
      return { ok: false, errorKey: 'nameTaken' };
    }
    throw error;
  }
}

export async function updateCompany(
  input: CompanyProfileUpdateInput & { companyId: string },
): Promise<AdminMutationResult<{ companyId: string }>> {
  const result = await prisma.company.updateMany({
    where: { id: input.companyId },
    data: toCompanyProfileWriteData(input),
  });

  if (result.count === 0) {
    return { ok: false, errorKey: 'notFound' };
  }

  return { ok: true, companyId: input.companyId };
}
