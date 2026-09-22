import { ConflictException } from '@nestjs/common';
import { Prisma } from '@toonexpo/db';

import { SLUG_UNIQUENESS_MAX_ATTEMPTS } from '../constants/slug.constants.js';

const MIN_SLUG_BASE_LENGTH = 1;

const UNIQUE_SLUG_EXHAUSTED_MESSAGE = 'Unable to generate a unique slug';

const SLUG_CONSTRAINT_MARKER = 'slug';

/**
 * Appends `-2`, `-3`, … while keeping the result within `maxLength`.
 * Attempt `1` is the base with no suffix.
 */
export const withNumericSuffix = (base: string, attempt: number, maxLength: number): string => {
  if (attempt <= 1) {
    return base.slice(0, maxLength);
  }

  const tail = `-${attempt}`;
  const room = Math.max(maxLength - tail.length, MIN_SLUG_BASE_LENGTH);
  return `${base.slice(0, room)}${tail}`.slice(0, maxLength);
};

type AllocateUniqueSlugOptions = {
  base: string;
  maxLength: number;
  isTaken: (candidate: string) => Promise<boolean>;
};

/**
 * Returns the base slug, or the next free `-n` suffix, up to the attempt cap.
 */
export const allocateUniqueSlug = async (options: AllocateUniqueSlugOptions): Promise<string> => {
  for (let attempt = 1; attempt <= SLUG_UNIQUENESS_MAX_ATTEMPTS; attempt += 1) {
    const candidate = withNumericSuffix(options.base, attempt, options.maxLength);
    if (!(await options.isTaken(candidate))) {
      return candidate;
    }
  }

  throw new ConflictException(UNIQUE_SLUG_EXHAUSTED_MESSAGE);
};

/**
 * True when Prisma rejected the write because a slug unique constraint lost the race.
 */
export const uniqueConstraintTargetsSlug = (error: unknown): boolean => {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') {
    return false;
  }

  const target = error.meta?.['target'];
  if (Array.isArray(target)) {
    return target.some((field) => String(field).includes(SLUG_CONSTRAINT_MARKER));
  }
  return typeof target === 'string' && target.includes(SLUG_CONSTRAINT_MARKER);
};

type InsertWithUniqueSlugOptions<T> = AllocateUniqueSlugOptions & {
  insert: (slug: string) => Promise<T>;
};

/**
 * Inserts with a free slug and retries when a concurrent write takes the same value.
 */
export const insertWithUniqueSlug = async <T>(
  options: InsertWithUniqueSlugOptions<T>,
): Promise<T> => {
  const blocked = new Set<string>();

  for (let attempt = 0; attempt < SLUG_UNIQUENESS_MAX_ATTEMPTS; attempt += 1) {
    const slug = await allocateUniqueSlug({
      base: options.base,
      maxLength: options.maxLength,
      isTaken: async (candidate) => blocked.has(candidate) || options.isTaken(candidate),
    });

    try {
      return await options.insert(slug);
    } catch (error) {
      if (!uniqueConstraintTargetsSlug(error)) {
        throw error;
      }
      blocked.add(slug);
    }
  }

  throw new ConflictException(UNIQUE_SLUG_EXHAUSTED_MESSAGE);
};
