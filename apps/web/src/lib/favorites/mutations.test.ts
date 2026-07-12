import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockFindFirst = vi.fn();
const mockCreate = vi.fn();
const mockDeleteMany = vi.fn();
const mockFindUnique = vi.fn();
const mockScheduleAnalyticsEvent = vi.fn();

vi.mock('@toonexpo/db', () => ({
  Prisma: {
    PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {
      code: string;
      clientVersion: string;
      constructor(message: string, params: { code: string; clientVersion: string }) {
        super(message);
        this.code = params.code;
        this.clientVersion = params.clientVersion;
      }
    },
  },
  prisma: {
    project: { findFirst: (...args: unknown[]) => mockFindFirst(...args) },
    apartment: { findFirst: (...args: unknown[]) => mockFindFirst(...args) },
    favorite: {
      create: (...args: unknown[]) => mockCreate(...args),
      deleteMany: (...args: unknown[]) => mockDeleteMany(...args),
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
  },
}));

vi.mock('@/lib/analytics/record-event', () => ({
  scheduleAnalyticsEvent: (...args: unknown[]) => mockScheduleAnalyticsEvent(...args),
}));

import { Prisma } from '@toonexpo/db';

import { addFavorite, removeFavorite, toggleFavorite } from './mutations';

const PROJECT_ID = 'clxxxxxxxxxxxxxxxxxxxx';
const USER_ID = 'cluyyyyyyyyyyyyyyyyyyy';

describe('addFavorite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects unpublished targets', async () => {
    mockFindFirst.mockResolvedValue(null);

    const result = await addFavorite(USER_ID, {
      targetType: 'PROJECT',
      targetId: PROJECT_ID,
    });

    expect(result).toEqual({ ok: false, errorKey: 'notFound' });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('creates a favorite and records analytics', async () => {
    mockFindFirst.mockResolvedValue({ id: PROJECT_ID, companyId: 'co1' });
    mockCreate.mockResolvedValue({ id: 'fav1' });

    const result = await addFavorite(USER_ID, {
      targetType: 'PROJECT',
      targetId: PROJECT_ID,
    });

    expect(result).toEqual({ ok: true, favorited: true });
    expect(mockScheduleAnalyticsEvent).toHaveBeenCalledWith({
      type: 'FAVORITE_ADDED',
      companyId: 'co1',
      projectId: PROJECT_ID,
      apartmentId: undefined,
    });
  });

  it('is idempotent on unique constraint conflict', async () => {
    mockFindFirst.mockResolvedValue({ id: PROJECT_ID, companyId: 'co1' });
    mockCreate.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    const result = await addFavorite(USER_ID, {
      targetType: 'PROJECT',
      targetId: PROJECT_ID,
    });

    expect(result).toEqual({ ok: true, favorited: true });
  });
});

describe('removeFavorite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('removes an existing favorite', async () => {
    mockFindFirst.mockResolvedValue({ id: PROJECT_ID, companyId: 'co1' });
    mockDeleteMany.mockResolvedValue({ count: 1 });

    const result = await removeFavorite(USER_ID, {
      targetType: 'PROJECT',
      targetId: PROJECT_ID,
    });

    expect(result).toEqual({ ok: true, favorited: false });
    expect(mockScheduleAnalyticsEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'FAVORITE_REMOVED' }),
    );
  });
});

describe('toggleFavorite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adds when absent and removes when present', async () => {
    mockFindUnique.mockResolvedValueOnce(null);
    mockFindFirst.mockResolvedValue({ id: PROJECT_ID, companyId: 'co1' });
    mockCreate.mockResolvedValue({ id: 'fav1' });

    await expect(
      toggleFavorite(USER_ID, { targetType: 'PROJECT', targetId: PROJECT_ID }),
    ).resolves.toEqual({ ok: true, favorited: true });

    mockFindUnique.mockResolvedValueOnce({ id: 'fav1' });
    mockFindFirst.mockResolvedValue({ id: PROJECT_ID, companyId: 'co1' });
    mockDeleteMany.mockResolvedValue({ count: 1 });

    await expect(
      toggleFavorite(USER_ID, { targetType: 'PROJECT', targetId: PROJECT_ID }),
    ).resolves.toEqual({ ok: true, favorited: false });
  });
});
