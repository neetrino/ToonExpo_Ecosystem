import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockVenueFindFirst = vi.fn();
const mockVenueCount = vi.fn();
const mockBoothFindFirst = vi.fn();

vi.mock('@toonexpo/db', () => ({
  prisma: {
    venueMap: {
      findFirst: (...args: unknown[]) => mockVenueFindFirst(...args),
      count: (...args: unknown[]) => mockVenueCount(...args),
    },
    booth: {
      findFirst: (...args: unknown[]) => mockBoothFindFirst(...args),
    },
  },
}));

import { hasPublicVenueMap, loadCompanyActiveBooth, loadPublicVenueMap } from './venue-queries';

describe('loadPublicVenueMap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when no ACTIVE venue map exists', async () => {
    mockVenueFindFirst.mockResolvedValue(null);
    await expect(loadPublicVenueMap()).resolves.toBeNull();
  });

  it('returns the ACTIVE event venue map with booths', async () => {
    mockVenueFindFirst.mockResolvedValue({
      id: 'vm-1',
      imageUrl: 'https://picsum.photos/seed/v/800/600',
      imageAlt: 'Plan',
      entranceXPercent: 50,
      entranceYPercent: 95,
      event: { id: 'evt-1', name: 'Demo', code: 'demo', status: 'ACTIVE' },
      booths: [
        {
          id: 'b-1',
          code: 'A12',
          label: 'Demo Development',
          xPercent: 28,
          yPercent: 42,
          note: null,
          company: { id: 'co-1', name: 'Demo Development', slug: 'demo-development' },
          partner: null,
        },
      ],
      pathNodes: [],
      pathEdges: [],
    });

    const result = await loadPublicVenueMap();
    expect(result?.event.status).toBe('ACTIVE');
    expect(result?.booths[0]?.code).toBe('A12');
    expect(result?.entranceXPercent).toBe(50);
    expect(result?.pathNodes).toEqual([]);
    expect(mockVenueFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { event: { status: 'ACTIVE' } },
      }),
    );
  });
});

describe('hasPublicVenueMap', () => {
  it('is true when an ACTIVE venue map exists', async () => {
    mockVenueCount.mockResolvedValue(1);
    await expect(hasPublicVenueMap()).resolves.toBe(true);
  });
});

describe('loadCompanyActiveBooth', () => {
  it('returns booth assignment for the ACTIVE event', async () => {
    mockBoothFindFirst.mockResolvedValue({
      code: 'A12',
      label: 'Demo Development',
      venueMap: { event: { name: 'ToonExpo 2026 Demo' } },
    });
    await expect(loadCompanyActiveBooth('co-1')).resolves.toEqual({
      code: 'A12',
      label: 'Demo Development',
      eventName: 'ToonExpo 2026 Demo',
    });
  });
});
