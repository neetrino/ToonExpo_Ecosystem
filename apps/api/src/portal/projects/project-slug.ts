import { ConflictException } from '@nestjs/common';

import {
  insertWithUniqueSlug,
  uniqueConstraintTargetsSlug,
} from '../../common/utils/allocate-unique-slug.js';
import type { PrismaService } from '../../prisma/prisma.service.js';
import { PORTAL_SLUG_MAX_LENGTH } from '../portal.constants.js';
import { normalizePortalSlug } from '../utils/slug.js';

export const PROJECT_SLUG_CONFLICT_MESSAGE = 'Project slug already exists';

const PROJECT_SLUG_FALLBACK = 'project';

type Db = PrismaService['db'];

/**
 * Slug base for a new project: the requested slug, otherwise the display name.
 */
export const projectSlugBase = (requested: string | undefined, name: string): string =>
  normalizePortalSlug(requested?.trim() || name, PROJECT_SLUG_FALLBACK);

const projectSlugTaken = async (
  db: Db,
  slug: string,
  excludeProjectId?: string,
): Promise<boolean> => {
  const existing = await db.project.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!existing) {
    return false;
  }
  return existing.id !== excludeProjectId;
};

/**
 * Keeps an edited slug only when it is free or already belongs to this project.
 */
export const assertProjectSlugAvailable = async (
  db: Db,
  projectId: string,
  requested: string,
): Promise<string> => {
  const normalized = normalizePortalSlug(requested, PROJECT_SLUG_FALLBACK);
  const current = await db.project.findUnique({
    where: { id: projectId },
    select: { slug: true },
  });
  if (current?.slug === normalized) {
    return normalized;
  }
  if (await projectSlugTaken(db, normalized, projectId)) {
    throw new ConflictException(PROJECT_SLUG_CONFLICT_MESSAGE);
  }
  return normalized;
};

/**
 * Turns a lost slug race on update into a conflict the form can show.
 */
export const rethrowProjectSlugConflict = (error: unknown): void => {
  if (uniqueConstraintTargetsSlug(error)) {
    throw new ConflictException(PROJECT_SLUG_CONFLICT_MESSAGE);
  }
};

/**
 * Creates a row with `name`, `name-2`, … when the slug is already taken.
 */
export const insertProjectWithUniqueSlug = <T>(
  db: Db,
  base: string,
  insert: (slug: string) => Promise<T>,
): Promise<T> =>
  insertWithUniqueSlug({
    base,
    maxLength: PORTAL_SLUG_MAX_LENGTH,
    isTaken: (slug) => projectSlugTaken(db, slug),
    insert,
  });
