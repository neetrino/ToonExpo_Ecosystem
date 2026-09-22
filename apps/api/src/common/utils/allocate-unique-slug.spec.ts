import { ConflictException } from '@nestjs/common';
import { Prisma } from '@toonexpo/db';
import { describe, expect, it, vi } from 'vitest';

import { SLUG_UNIQUENESS_MAX_ATTEMPTS } from '../constants/slug.constants.js';
import {
  allocateUniqueSlug,
  insertWithUniqueSlug,
  uniqueConstraintTargetsSlug,
  withNumericSuffix,
} from './allocate-unique-slug.js';

const MAX_LENGTH = 120;

describe('withNumericSuffix', () => {
  it('keeps the base on the first attempt', () => {
    expect(withNumericSuffix('northern-hills', 1, MAX_LENGTH)).toBe('northern-hills');
  });

  it('trims the base so the numeric suffix still fits', () => {
    const base = 'a'.repeat(MAX_LENGTH);
    const slug = withNumericSuffix(base, 2, MAX_LENGTH);

    expect(slug.endsWith('-2')).toBe(true);
    expect(slug.length).toBeLessThanOrEqual(MAX_LENGTH);
  });
});

describe('allocateUniqueSlug', () => {
  it('returns the base when it is free', async () => {
    const isTaken = vi.fn().mockResolvedValue(false);

    await expect(
      allocateUniqueSlug({ base: 'northern-hills', maxLength: MAX_LENGTH, isTaken }),
    ).resolves.toBe('northern-hills');
  });

  it('uses -2 then -3 when earlier candidates are taken', async () => {
    const taken = new Set(['northern-hills', 'northern-hills-2']);
    const isTaken = vi.fn(async (candidate: string) => taken.has(candidate));

    await expect(
      allocateUniqueSlug({ base: 'northern-hills', maxLength: MAX_LENGTH, isTaken }),
    ).resolves.toBe('northern-hills-3');
  });

  it('throws when every attempt is taken', async () => {
    const isTaken = vi.fn().mockResolvedValue(true);

    await expect(
      allocateUniqueSlug({ base: 'northern-hills', maxLength: MAX_LENGTH, isTaken }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(isTaken).toHaveBeenCalledTimes(SLUG_UNIQUENESS_MAX_ATTEMPTS);
  });
});

describe('insertWithUniqueSlug', () => {
  it('retries the next suffix after a slug unique race', async () => {
    const isTaken = vi.fn().mockResolvedValue(false);
    const insert = vi
      .fn()
      .mockRejectedValueOnce(slugConflict())
      .mockImplementation(async (slug: string) => ({ slug }));

    await expect(
      insertWithUniqueSlug({
        base: 'north-quarter',
        maxLength: MAX_LENGTH,
        isTaken,
        insert,
      }),
    ).resolves.toEqual({ slug: 'north-quarter-2' });
  });

  it('does not treat a non-slug unique violation as a slug retry', async () => {
    const conflict = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: 'test',
      meta: { target: ['floor_id', 'number'] },
    });
    const insert = vi.fn().mockRejectedValue(conflict);

    await expect(
      insertWithUniqueSlug({
        base: 'project-unit-apt-1',
        maxLength: MAX_LENGTH,
        isTaken: async () => false,
        insert,
      }),
    ).rejects.toBe(conflict);
    expect(insert).toHaveBeenCalledTimes(1);
  });
});

describe('uniqueConstraintTargetsSlug', () => {
  it('matches a slug field and a slug constraint name', () => {
    expect(uniqueConstraintTargetsSlug(slugConflict())).toBe(true);
    expect(
      uniqueConstraintTargetsSlug(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: 'test',
          meta: { target: 'districts_project_id_slug_key' },
        }),
      ),
    ).toBe(true);
  });
});

const slugConflict = (): Prisma.PrismaClientKnownRequestError =>
  new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
    code: 'P2002',
    clientVersion: 'test',
    meta: { target: ['slug'] },
  });
