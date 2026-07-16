import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUpdateMany = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockFindUnique = vi.fn();
const mockFindMany = vi.fn();
const mockTransaction = vi.fn();

const { recordAudit } = vi.hoisted(() => ({
  recordAudit: vi.fn(),
}));

vi.mock('@/lib/admin/mutation-result', () => ({
  UNIQUE_CONSTRAINT_ERROR: 'P2002',
}));

vi.mock('@/lib/audit/record-audit', () => ({
  recordAudit,
  formatStatusTransition: (from: string, to: string) => `${from}→${to}`,
}));

vi.mock('@toonexpo/db', () => ({
  prisma: {
    exhibitionEvent: {
      create: (...args: unknown[]) => mockCreate(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
      updateMany: (...args: unknown[]) => mockUpdateMany(...args),
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      findMany: (...args: unknown[]) => mockFindMany(...args),
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

const ACTOR = { userId: 'admin-1', role: 'BIGPROJECTS_ADMIN' as const };

function txClient() {
  return {
    exhibitionEvent: {
      create: (...args: unknown[]) => mockCreate(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
      updateMany: (...args: unknown[]) => mockUpdateMany(...args),
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
    auditLog: { create: vi.fn() },
  };
}

describe('upsertExhibitionEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn(txClient()),
    );
    mockCreate.mockResolvedValue({ id: 'event-2' });
    mockFindUnique.mockResolvedValue({ id: 'event-1', status: 'PLANNING' });
    mockUpdate.mockResolvedValue({ id: 'event-1' });
    mockUpdateMany.mockResolvedValue({ count: 1 });
    mockFindMany.mockResolvedValue([{ id: 'event-old', status: 'ACTIVE' }]);
    recordAudit.mockResolvedValue(undefined);
  });

  it('demotes other ACTIVE events when activating a second event', async () => {
    const result = await upsertExhibitionEvent(
      {
        eventId: 'event-2',
        name: 'Summer Expo',
        code: 'summer',
        status: 'ACTIVE',
      },
      ACTOR,
    );

    expect(result).toEqual({ ok: true, eventId: 'event-2' });
    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { id: { in: ['event-old'] } },
      data: { status: 'PLANNING' },
    });
    expect(mockUpdate).toHaveBeenCalled();
    expect(recordAudit).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        entityType: 'EXHIBITION_EVENT',
        entityId: 'event-old',
        detail: 'ACTIVE→PLANNING',
      }),
    );
  });

  it('demotes existing ACTIVE events when creating a new ACTIVE event', async () => {
    const result = await upsertExhibitionEvent(
      {
        name: 'Winter Expo',
        code: 'winter',
        status: 'ACTIVE',
      },
      ACTOR,
    );

    expect(result).toEqual({ ok: true, eventId: 'event-2' });
    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { id: { in: ['event-old'] } },
      data: { status: 'PLANNING' },
    });
    expect(mockCreate).toHaveBeenCalled();
  });

  it('writes an audit row when event status changes', async () => {
    mockFindMany.mockResolvedValue([]);

    await upsertExhibitionEvent(
      {
        eventId: 'event-1',
        name: 'Summer Expo',
        code: 'summer',
        status: 'ACTIVE',
      },
      ACTOR,
    );

    expect(recordAudit).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        entityType: 'EXHIBITION_EVENT',
        entityId: 'event-1',
        detail: 'PLANNING→ACTIVE',
      }),
    );
  });
});
