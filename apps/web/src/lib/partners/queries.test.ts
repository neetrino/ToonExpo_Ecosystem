import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockPartnerFindMany = vi.fn();
const mockPartnerFindFirst = vi.fn();
const mockBankOfferFindMany = vi.fn();

vi.mock('@toonexpo/db', () => ({
  prisma: {
    partner: {
      findMany: (...args: unknown[]) => mockPartnerFindMany(...args),
      findFirst: (...args: unknown[]) => mockPartnerFindFirst(...args),
    },
    bankOffer: {
      findMany: (...args: unknown[]) => mockBankOfferFindMany(...args),
    },
  },
}));

import { getPublishedBankOffers, getPublishedPartnerBySlug, getPublishedPartners } from './queries';

describe('partner public queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPartnerFindMany.mockResolvedValue([]);
    mockPartnerFindFirst.mockResolvedValue(null);
    mockBankOfferFindMany.mockResolvedValue([]);
  });

  it('lists only PUBLISHED partners', async () => {
    await getPublishedPartners();

    expect(mockPartnerFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'PUBLISHED' }),
      }),
    );
  });

  it('loads partner detail with PUBLISHED partner and offers', async () => {
    await getPublishedPartnerBySlug('demo-bank');

    expect(mockPartnerFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: 'demo-bank', status: 'PUBLISHED' },
        select: expect.objectContaining({
          bankOffers: expect.objectContaining({
            where: { status: 'PUBLISHED' },
          }),
        }),
      }),
    );
  });

  it('loads bank offers only from PUBLISHED bank partners', async () => {
    await getPublishedBankOffers();

    expect(mockBankOfferFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: 'PUBLISHED',
          partner: { status: 'PUBLISHED', type: 'BANK' },
        },
      }),
    );
  });
});
