import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockApiRequest = vi.fn();

vi.mock('@/lib/api', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
  ApiClientError: class ApiClientError extends Error {
    constructor(readonly status: number) {
      super('API error');
    }
  },
}));

import {
  getPublishedBankOffers,
  getPublishedPartnerBySlug,
  getPublishedPartners,
} from './queries';

describe('partner public API queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiRequest.mockResolvedValue([]);
  });

  it('forwards the optional partner type', async () => {
    await getPublishedPartners('BANK');
    expect(mockApiRequest).toHaveBeenCalledWith('/catalog/partners?type=BANK');
  });

  it('loads partner detail by slug', async () => {
    mockApiRequest.mockResolvedValue({
      id: 'partner-1',
      name: 'Bank',
      slug: 'bank',
      type: 'BANK',
      logoUrl: null,
      description: null,
      phone: null,
      email: null,
      website: null,
      serviceCategories: [],
      bankOffers: [],
    });
    await getPublishedPartnerBySlug('bank');
    expect(mockApiRequest).toHaveBeenCalledWith('/catalog/partners/bank');
  });

  it('loads published bank offers from Nest', async () => {
    await expect(getPublishedBankOffers()).resolves.toEqual([]);
    expect(mockApiRequest).toHaveBeenCalledWith('/catalog/bank-offers');
  });
});
