import { ConflictException } from '@nestjs/common';

import { uniqueConstraintTargetsSlug } from '../common/utils/allocate-unique-slug.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { slugifyDistrictName } from './interactive-mapping.helpers.js';

export const DISTRICT_SLUG_CONFLICT_MESSAGE = 'District slug already exists for this project';

type Db = PrismaService['db'];

/**
 * True when another district in the same project already owns the slug.
 */
export const districtSlugTaken = async (
  db: Db,
  projectId: string,
  slug: string,
  excludeDistrictId?: string,
): Promise<boolean> => {
  const existing = await db.district.findFirst({
    where: {
      projectId,
      slug,
      ...(excludeDistrictId ? { id: { not: excludeDistrictId } } : {}),
    },
    select: { id: true },
  });
  return existing !== null;
};

/**
 * Accepts an edited district slug only when it is free inside the project.
 */
export const assertDistrictSlugAvailable = async (
  db: Db,
  projectId: string,
  rawSlug: string,
  excludeDistrictId?: string,
): Promise<string> => {
  const normalized = slugifyDistrictName(rawSlug);
  if (await districtSlugTaken(db, projectId, normalized, excludeDistrictId)) {
    throw new ConflictException(DISTRICT_SLUG_CONFLICT_MESSAGE);
  }
  return normalized;
};

/**
 * Maps a lost district-slug race to the same conflict as an explicit duplicate.
 */
export const rethrowDistrictSlugConflict = (error: unknown): void => {
  if (uniqueConstraintTargetsSlug(error)) {
    throw new ConflictException(DISTRICT_SLUG_CONFLICT_MESSAGE);
  }
};
