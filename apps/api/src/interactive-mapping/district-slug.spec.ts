import { describe, expect, it, vi } from 'vitest';

import type { PrismaService } from '../prisma/prisma.service.js';
import { districtSlugTaken } from './district-slug.js';

describe('districtSlugTaken', () => {
  it('scopes the lookup to one project', async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    const db = { district: { findFirst } } as unknown as PrismaService['db'];

    await expect(districtSlugTaken(db, 'project-b', 'north-quarter')).resolves.toBe(false);
    expect(findFirst).toHaveBeenCalledWith({
      where: { projectId: 'project-b', slug: 'north-quarter' },
      select: { id: true },
    });
  });
});
