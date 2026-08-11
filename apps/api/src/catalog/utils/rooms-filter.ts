import type { Prisma } from '@toonexpo/db';

/** `4` in the public catalog UI means “4 or more rooms”. */
export const CATALOG_FOUR_PLUS_ROOMS = 4;

/**
 * Builds Prisma rooms filter for public catalog queries.
 */
export const buildRoomsFilter = (rooms: number[]): Prisma.ApartmentWhereInput => {
  const exact = rooms.filter((count) => count < CATALOG_FOUR_PLUS_ROOMS);
  const includeFourPlus = rooms.includes(CATALOG_FOUR_PLUS_ROOMS);

  if (exact.length > 0 && includeFourPlus) {
    return {
      OR: [{ rooms: { in: exact } }, { rooms: { gte: CATALOG_FOUR_PLUS_ROOMS } }],
    };
  }

  if (includeFourPlus) {
    return { rooms: { gte: CATALOG_FOUR_PLUS_ROOMS } };
  }

  return { rooms: { in: exact } };
};
