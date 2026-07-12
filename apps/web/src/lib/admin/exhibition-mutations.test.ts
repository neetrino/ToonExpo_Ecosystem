import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUpdateMany = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockFindUnique = vi.fn();
const mockTransaction = vi.fn();

vi.mock('@/lib/admin/mutation-result', () => ({
  UNIQUE_CONSTRAINT_ERROR: 'P2002',
}));

vi.mock('@toonexpo/db', () => ({
  prisma: {
    exhibitionEvent: {
      create: (...args: unknown[]) => mockCreate(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
      updateMany: (...args: unknown[]) => mockUpdateMany(...args),
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
    $transaction: (...args: unknown[]) => mockTransaction(...args),
  },
  Prisma: {
    PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {
      code: string;
      meta?: { target?: string[] };
      constructor(message: string, code: string) {
        super(message);
        this.code = code;
      }
    },
  },
}));

import { upsertExhibitionEvent } from './exhibition-mutations';

function txClient() {
  return {
    exhibitionEvent: {
      create: (...args: unknown[]) => mockCreate(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
      updateMany: (...args: unknown[]) => mockUpdateMany(...args),
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
  };
}

describe('upsertExhibitionEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn(txClient()),
    );
    mockCreate.mockResolvedValue({ id: 'event-2' });
    mockFindUnique.mockResolvedValue({ id: 'event-1' });
    mockUpdate.mockResolvedValue({ id: 'event-1' });
    mockUpdateMany.mockResolvedValue({ count: 1 });
  });

  it('demotes other ACTIVE events when activating a second event', async () => {
    const result = await upsertExhibitionEvent({
      eventId: 'event-2',
      name: 'Summer Expo',
      code: 'summer',
      status: 'ACTIVE',
    });

    expect(result).toEqual({ ok: true, eventId: 'event-2' });
    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { status: 'ACTIVE', id: { not: 'event-2' } },
      data: { status: 'PLANNING' },
    });
    expect(mockUpdate).toHaveBeenCalled();
  });

  it('demotes existing ACTIVE events when creating a new ACTIVE event', async () => {
    const result = await upsertExhibitionEvent({
      name: 'Winter Expo',
      code: 'winter',
      status: 'ACTIVE',
    });

    expect(result).toEqual({ ok: true, eventId: 'event-2' });
    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { status: 'ACTIVE' },
      data: { status: 'PLANNING' },
    });
    expect(mockCreate).toHaveBeenCalled();
  });
});
