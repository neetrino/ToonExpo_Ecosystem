import type { PartnerSelfProfileInput } from '@toonexpo/contracts';
import { prisma, Prisma } from '@toonexpo/db';

import { bestEffortDeleteReplacedR2Object } from '@/lib/storage';

import { type AdminMutationResult, UNIQUE_CONSTRAINT_ERROR } from '@/lib/admin/mutation-result';

type PartnerProfileWriteData = {
  name: string;
  logoUrl: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  serviceCategories: string[];
};

function toProfileWriteData(input: PartnerSelfProfileInput): PartnerProfileWriteData {
  return {
    name: input.name,
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

/**
 * Updates own partner content fields only. Type and publication status are unchanged.
 * `partnerId` must come from assertPartnerSession — never from client input alone.
 */
export async function updateOwnPartnerProfile(
  partnerId: string,
  input: PartnerSelfProfileInput,
): Promise<AdminMutationResult<{ partnerId: string; partnerSlug: string }>> {
  const data = toProfileWriteData(input);

  try {
    const existing = await prisma.partner.findUnique({
      where: { id: partnerId },
      select: { id: true, slug: true, logoUrl: true },
    });
    if (!existing) {
      return { ok: false, errorKey: 'notFound' };
    }

    await prisma.partner.update({
      where: { id: partnerId },
      data,
    });

    await bestEffortDeleteReplacedR2Object(existing.logoUrl, data.logoUrl);

    return { ok: true, partnerId: existing.id, partnerSlug: existing.slug };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, errorKey: 'nameTaken' };
    }
    throw error;
  }
}
