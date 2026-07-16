import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockCompanyFindMany = vi.fn();
const mockCompanyFindFirst = vi.fn();

vi.mock('@toonexpo/db', () => ({
  prisma: {
    company: {
      findMany: (...args: unknown[]) => mockCompanyFindMany(...args),
      findFirst: (...args: unknown[]) => mockCompanyFindFirst(...args),
    },
  },
}));

import { getPublicBuilderBySlug, getPublicBuilders } from './queries';

describe('builder public queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCompanyFindMany.mockResolvedValue([]);
    mockCompanyFindFirst.mockResolvedValue(null);
  });

  it('lists only companies with published projects', async () => {
    await getPublicBuilders();

    expect(mockCompanyFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { projects: { some: { status: 'PUBLISHED' } } },
        orderBy: { name: 'asc' },
      }),
    );
  });

  it('loads builder detail only when published projects exist', async () => {
    await getPublicBuilderBySlug('demo-development');

    expect(mockCompanyFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: 'demo-development', projects: { some: { status: 'PUBLISHED' } } },
        select: expect.objectContaining({
          projects: expect.objectContaining({
            where: { status: 'PUBLISHED' },
          }),
        }),
      }),
    );
  });
});
