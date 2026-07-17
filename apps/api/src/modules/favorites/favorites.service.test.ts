import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  projectFindFirst: vi.fn(),
  projectFindMany: vi.fn(),
  apartmentFindFirst: vi.fn(),
  apartmentFindMany: vi.fn(),
  favoriteFindUnique: vi.fn(),
  favoriteFindMany: vi.fn(),
  favoriteCreate: vi.fn(),
  favoriteDeleteMany: vi.fn(),
  analyticsCreate: vi.fn(),
}));

vi.mock('../../common/prisma.service', () => ({
  PrismaService: class {
    client = {
      project: {
        findFirst: mocks.projectFindFirst,
        findMany: mocks.projectFindMany,
      },
      apartment: {
        findFirst: mocks.apartmentFindFirst,
        findMany: mocks.apartmentFindMany,
      },
      favorite: {
        findUnique: mocks.favoriteFindUnique,
        findMany: mocks.favoriteFindMany,
        create: mocks.favoriteCreate,
        deleteMany: mocks.favoriteDeleteMany,
      },
      analyticsEvent: { create: mocks.analyticsCreate },
    };
  },
}));

import { PrismaService } from '../../common/prisma.service';
import { FavoritesService } from './favorites.service';

const INPUT = {
  targetType: 'PROJECT' as const,
  targetId: 'clxxxxxxxxxxxxxxxxxxxx',
};

describe('FavoritesService', () => {
  let service: FavoritesService;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.analyticsCreate.mockResolvedValue({ id: 'event-1' });
    service = new FavoritesService(new PrismaService());
  });

  it('returns not found for an unpublished target', async () => {
    mocks.projectFindFirst.mockResolvedValue(null);

    await expect(service.add('buyer-1', INPUT)).resolves.toBeNull();
    expect(mocks.favoriteCreate).not.toHaveBeenCalled();
  });

  it('adds a published project favorite and records analytics', async () => {
    mocks.projectFindFirst.mockResolvedValue({ id: INPUT.targetId, companyId: 'company-1' });
    mocks.favoriteCreate.mockResolvedValue({ id: 'favorite-1' });

    await expect(service.add('buyer-1', INPUT)).resolves.toEqual({ favorited: true });
    expect(mocks.analyticsCreate).toHaveBeenCalledWith({
      data: {
        type: 'FAVORITE_ADDED',
        companyId: 'company-1',
        projectId: INPUT.targetId,
        apartmentId: undefined,
      },
    });
  });

  it('toggles an existing favorite off', async () => {
    mocks.favoriteFindUnique.mockResolvedValue({ id: 'favorite-1' });
    mocks.projectFindFirst.mockResolvedValue({ id: INPUT.targetId, companyId: 'company-1' });
    mocks.favoriteDeleteMany.mockResolvedValue({ count: 1 });

    await expect(service.toggle('buyer-1', INPUT)).resolves.toEqual({ favorited: false });
  });
});
