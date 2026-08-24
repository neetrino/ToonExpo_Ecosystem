import type { Prisma } from '@toonexpo/db';

import type { PrismaService } from '../../prisma/prisma.service.js';

/**
 * Resolves an apartment by primary id or globally unique slug.
 */
export const findApartmentByRef = async <S extends Prisma.ApartmentSelect>(
  prisma: PrismaService,
  ref: string,
  select: S,
): Promise<Prisma.ApartmentGetPayload<{ select: S }> | null> => {
  const byId = await prisma.db.apartment.findUnique({
    where: { id: ref },
    select,
  });
  if (byId) {
    return byId;
  }
  return prisma.db.apartment.findUnique({
    where: { slug: ref },
    select,
  });
};

export const apartmentRefOrFilter = (ref: string): Prisma.ApartmentWhereInput => ({
  OR: [{ id: ref }, { slug: ref }],
});
