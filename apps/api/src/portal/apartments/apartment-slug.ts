import type { Prisma } from '@toonexpo/db';

import { insertWithUniqueSlug } from '../../common/utils/allocate-unique-slug.js';
import { PORTAL_SLUG_MAX_LENGTH } from '../portal.constants.js';
import { buildApartmentSlugBase } from '../utils/slug.js';

type ApartmentSlugDb = {
  apartment: {
    findUnique: (args: {
      where: { slug: string };
      select: { id: true };
    }) => Promise<{ id: string } | null>;
    create: (args: { data: Prisma.ApartmentUncheckedCreateInput }) => Promise<unknown>;
  };
};

/**
 * Inserts an apartment with `{project}-unit-{number}`, then `-2`, `-3` on collision.
 * A floor+number unique violation is not retried.
 */
export const insertApartmentWithUniqueSlug = <T>(
  db: ApartmentSlugDb,
  projectSlug: string,
  number: string,
  data: Omit<Prisma.ApartmentUncheckedCreateInput, 'slug'>,
): Promise<T> =>
  insertWithUniqueSlug({
    base: buildApartmentSlugBase(projectSlug, number),
    maxLength: PORTAL_SLUG_MAX_LENGTH,
    isTaken: async (slug) => {
      const existing = await db.apartment.findUnique({
        where: { slug },
        select: { id: true },
      });
      return existing !== null;
    },
    insert: (slug) => db.apartment.create({ data: { ...data, slug } }) as Promise<T>,
  });
