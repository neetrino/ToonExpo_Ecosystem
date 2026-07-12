import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockEventFindUnique = vi.fn();
const mockVenueUpsert = vi.fn();
const mockVenueFindUnique = vi.fn();
const mockBoothCreate = vi.fn();
const mockBoothUpdate = vi.fn();
const mockBoothFindFirst = vi.fn();
const mockBoothFindUnique = vi.fn();
const mockBoothDelete = vi.fn();
const mockCompanyFindUnique = vi.fn();
const mockPartnerFindUnique = vi.fn();

const { MockPrismaKnownRequestError } = vi.hoisted(() => {
  class MockPrismaKnownRequestError extends Error {
    code: string;
    meta?: { target?: string[] };
    constructor(message: string, code: string, meta?: { target?: string[] }) {
      super(message);
      this.code = code;
      this.meta = meta;
    }
  }
  return { MockPrismaKnownRequestError };
});

vi.mock('@/lib/admin/mutation-result', () => ({
  UNIQUE_CONSTRAINT_ERROR: 'P2002',
}));

vi.mock('@/lib/storage', () => ({
  bestEffortDeleteReplacedR2Object: vi.fn(),
}));

vi.mock('@toonexpo/db', () => ({
  prisma: {
    exhibitionEvent: { findUnique: (...args: unknown[]) => mockEventFindUnique(...args) },
    venueMap: {
      upsert: (...args: unknown[]) => mockVenueUpsert(...args),
      findUnique: (...args: unknown[]) => mockVenueFindUnique(...args),
    },
    booth: {
      create: (...args: unknown[]) => mockBoothCreate(...args),
      update: (...args: unknown[]) => mockBoothUpdate(...args),
      findFirst: (...args: unknown[]) => mockBoothFindFirst(...args),
      findUnique: (...args: unknown[]) => mockBoothFindUnique(...args),
      delete: (...args: unknown[]) => mockBoothDelete(...args),
    },
    company: { findUnique: (...args: unknown[]) => mockCompanyFindUnique(...args) },
    partner: { findUnique: (...args: unknown[]) => mockPartnerFindUnique(...args) },
  },
  Prisma: {
    PrismaClientKnownRequestError: MockPrismaKnownRequestError,
  },
}));

import { deleteBooth, upsertBooth, upsertVenueMap } from './venue-mutations';

describe('upsertVenueMap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns notFound when the event does not exist', async () => {
    mockEventFindUnique.mockResolvedValue(null);
    const result = await upsertVenueMap({
      eventId: 'missing',
      imageUrl: 'https://picsum.photos/seed/v/800/600',
    });
    expect(result).toEqual({ ok: false, errorKey: 'notFound' });
    expect(mockVenueUpsert).not.toHaveBeenCalled();
  });

  it('upserts when the event exists', async () => {
    mockEventFindUnique.mockResolvedValue({ id: 'evt-1' });
    mockVenueFindUnique.mockResolvedValue(null);
    mockVenueUpsert.mockResolvedValue({ id: 'vm-1', eventId: 'evt-1' });
    const result = await upsertVenueMap({
      eventId: 'evt-1',
      imageUrl: 'https://picsum.photos/seed/v/800/600',
      imageAlt: 'Plan',
    });
    expect(result).toEqual({ ok: true, venueMapId: 'vm-1', eventId: 'evt-1' });
  });
});

describe('upsertBooth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVenueFindUnique.mockResolvedValue({ id: 'vm-1' });
    mockCompanyFindUnique.mockResolvedValue({ id: 'co-1' });
    mockPartnerFindUnique.mockResolvedValue({ id: 'pa-1' });
  });

  it('returns notFound when venue map is missing', async () => {
    mockVenueFindUnique.mockResolvedValue(null);
    const result = await upsertBooth({
      venueMapId: 'missing',
      code: 'A1',
      label: 'Stand',
      xPercent: 10,
      yPercent: 20,
    });
    expect(result).toEqual({ ok: false, errorKey: 'notFound' });
  });

  it('returns nameTaken on duplicate booth code', async () => {
    mockBoothCreate.mockRejectedValue(
      new MockPrismaKnownRequestError('unique', 'P2002', { target: ['venueMapId', 'code'] }),
    );
    const result = await upsertBooth({
      venueMapId: 'vm-1',
      code: 'A12',
      label: 'Dup',
      xPercent: 10,
      yPercent: 20,
    });
    expect(result).toEqual({ ok: false, errorKey: 'nameTaken' });
  });

  it('creates a booth with uppercased code', async () => {
    mockBoothCreate.mockResolvedValue({ id: 'b-1', venueMapId: 'vm-1' });
    const result = await upsertBooth({
      venueMapId: 'vm-1',
      code: 'a12',
      label: 'Demo',
      xPercent: 10,
      yPercent: 20,
      companyId: 'co-1',
    });
    expect(result).toEqual({ ok: true, boothId: 'b-1', venueMapId: 'vm-1' });
    expect(mockBoothCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ code: 'A12', companyId: 'co-1' }),
      }),
    );
  });
});

describe('deleteBooth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns notFound when booth is missing', async () => {
    mockBoothFindUnique.mockResolvedValue(null);
    const result = await deleteBooth({ boothId: 'missing' });
    expect(result).toEqual({ ok: false, errorKey: 'notFound' });
  });

  it('deletes an existing booth', async () => {
    mockBoothFindUnique.mockResolvedValue({ id: 'b-1', venueMapId: 'vm-1' });
    mockBoothDelete.mockResolvedValue({ id: 'b-1' });
    const result = await deleteBooth({ boothId: 'b-1' });
    expect(result).toEqual({ ok: true, boothId: 'b-1', venueMapId: 'vm-1' });
  });
});
