import type { Prisma } from '@toonexpo/db';

/**
 * Builds a Prisma where clause for free-text CRM contact search.
 */
export const buildCrmDealSearchWhere = (
  q: string | undefined,
): Prisma.CrmDealWhereInput | undefined => {
  const trimmed = q?.trim();
  if (!trimmed) {
    return undefined;
  }

  return {
    OR: [
      { contactName: { contains: trimmed, mode: 'insensitive' } },
      { contactPhone: { contains: trimmed, mode: 'insensitive' } },
      { contactEmail: { contains: trimmed, mode: 'insensitive' } },
      {
        buyerProfile: {
          OR: [
            { name: { contains: trimmed, mode: 'insensitive' } },
            { phone: { contains: trimmed, mode: 'insensitive' } },
            { email: { contains: trimmed, mode: 'insensitive' } },
          ],
        },
      },
    ],
  };
};
