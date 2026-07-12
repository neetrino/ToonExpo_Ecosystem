import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockTx = {
  project: { findFirst: vi.fn() },
  apartment: { findFirst: vi.fn() },
  deal: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
  dealActivity: { create: vi.fn() },
};

vi.mock('@toonexpo/db', () => ({
  prisma: {
    $transaction: vi.fn((callback: (tx: typeof mockTx) => Promise<unknown>) => callback(mockTx)),
  },
}));

import { submitPublicRequest } from './public-request-mutations';

const PUBLISHED_PROJECT_ID = 'project-published';
const COMPANY_ID = 'company-1';
const APARTMENT_ID = 'apt-101';
const FOREIGN_APARTMENT_ID = 'apt-foreign';

const VALID_INPUT = {
  projectId: PUBLISHED_PROJECT_ID,
  name: 'Test Buyer',
  phone: '+37491112222',
  email: 'test.request@example.com',
  message: 'Interested in this project',
};

describe('submitPublicRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockTx.project.findFirst).mockResolvedValue({
      id: PUBLISHED_PROJECT_ID,
      companyId: COMPANY_ID,
    });
    vi.mocked(mockTx.deal.findFirst).mockResolvedValue(null);
    vi.mocked(mockTx.deal.create).mockResolvedValue({ id: 'deal-new' });
    vi.mocked(mockTx.dealActivity.create).mockResolvedValue({ id: 'activity-1' });
    vi.mocked(mockTx.deal.update).mockResolvedValue({ id: 'deal-existing' });
  });

  it('returns notFound for a draft or missing project', async () => {
    vi.mocked(mockTx.project.findFirst).mockResolvedValue(null);

    const result = await submitPublicRequest(VALID_INPUT);

    expect(result).toEqual({ ok: false, errorKey: 'notFound' });
    expect(mockTx.deal.create).not.toHaveBeenCalled();
  });

  it('returns invalidInput when apartment does not belong to the project', async () => {
    vi.mocked(mockTx.apartment.findFirst).mockResolvedValue(null);

    const result = await submitPublicRequest({
      ...VALID_INPUT,
      apartmentId: FOREIGN_APARTMENT_ID,
    });

    expect(result).toEqual({ ok: false, errorKey: 'invalidInput' });
    expect(mockTx.deal.create).not.toHaveBeenCalled();
  });

  it('deduplicates an open deal with the same email and appends activity', async () => {
    vi.mocked(mockTx.deal.findFirst).mockResolvedValue({ id: 'deal-existing' });

    const result = await submitPublicRequest(VALID_INPUT);

    expect(result).toEqual({ ok: true, deduped: true, dealId: 'deal-existing' });
    expect(mockTx.deal.create).not.toHaveBeenCalled();
    expect(mockTx.dealActivity.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          dealId: 'deal-existing',
          type: 'COMMENT',
          body: VALID_INPUT.message,
        }),
      }),
    );
    expect(mockTx.deal.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'deal-existing' } }),
    );
  });

  it('creates a new deal with activity and apartment link when apartmentId is valid', async () => {
    vi.mocked(mockTx.apartment.findFirst).mockResolvedValue({
      id: APARTMENT_ID,
      priceAmd: 18_500_000,
      status: 'AVAILABLE',
    });

    const result = await submitPublicRequest({
      ...VALID_INPUT,
      apartmentId: APARTMENT_ID,
    });

    expect(result).toEqual({ ok: true, dealId: 'deal-new' });
    expect(mockTx.deal.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          companyId: COMPANY_ID,
          projectId: PUBLISHED_PROJECT_ID,
          stage: 'NEW_REQUEST',
          source: 'APARTMENT_PAGE',
          contactEmail: VALID_INPUT.email,
          apartments: {
            create: expect.objectContaining({
              apartmentId: APARTMENT_ID,
              priceAmdSnapshot: 18_500_000,
              statusSnapshot: 'AVAILABLE',
              snapshotAt: expect.any(Date),
            }),
          },
          activities: {
            create: expect.objectContaining({ type: 'COMMENT' }),
          },
        }),
      }),
    );
  });

  it('creates a new project-page deal when no duplicate exists', async () => {
    const result = await submitPublicRequest(VALID_INPUT);

    expect(result).toEqual({ ok: true, dealId: 'deal-new' });
    expect(mockTx.deal.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          source: 'PROJECT_PAGE',
          stage: 'NEW_REQUEST',
        }),
      }),
    );
  });
});
