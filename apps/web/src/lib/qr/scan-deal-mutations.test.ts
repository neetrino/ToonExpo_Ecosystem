import { beforeEach, describe, expect, it, vi } from 'vitest';

import { hashQrToken } from './token';

const mockTx = {
  qrCode: { findFirst: vi.fn() },
  project: { findFirst: vi.fn() },
  deal: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
  dealActivity: { create: vi.fn() },
};

vi.mock('@toonexpo/db', () => ({
  prisma: {
    $transaction: vi.fn((callback: (tx: typeof mockTx) => Promise<unknown>) => callback(mockTx)),
    qrScanLog: { create: vi.fn() },
  },
}));

import { createDealFromQrScan } from './scan-deal-mutations';

const TOKEN = 'builder-scan-token';
const QR_ID = 'qr-scan-1';
const BUYER_USER_ID = 'buyer-scan-1';
const BUILDER_USER_ID = 'builder-scan-1';
const COMPANY_ID = 'company-scan-1';
const PROJECT_ID = 'project-scan-1';

const ACTIVE_BUYER = {
  id: QR_ID,
  buyerProfile: {
    user: {
      id: BUYER_USER_ID,
      name: 'Scan Buyer',
      phone: '+37492222222',
      email: 'scan.buyer@example.com',
    },
  },
};

describe('createDealFromQrScan', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockTx.qrCode.findFirst).mockResolvedValue(ACTIVE_BUYER);
    vi.mocked(mockTx.project.findFirst).mockResolvedValue({ id: PROJECT_ID });
    vi.mocked(mockTx.deal.findFirst).mockResolvedValue(null);
    vi.mocked(mockTx.deal.create).mockResolvedValue({ id: 'deal-new' });
    vi.mocked(mockTx.dealActivity.create).mockResolvedValue({ id: 'activity-1' });
    vi.mocked(mockTx.deal.update).mockResolvedValue({ id: 'deal-existing' });
  });

  it('returns notFound when the QR token is inactive', async () => {
    vi.mocked(mockTx.qrCode.findFirst).mockResolvedValue(null);

    const result = await createDealFromQrScan({
      qrToken: TOKEN,
      builderUserId: BUILDER_USER_ID,
      companyId: COMPANY_ID,
    });

    expect(result).toEqual({ ok: false, errorKey: 'notFound' });
    expect(mockTx.qrCode.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tokenHash: hashQrToken(TOKEN), revokedAt: null },
      }),
    );
    expect(mockTx.deal.create).not.toHaveBeenCalled();
  });

  it('deduplicates an open deal for the same company, buyer, and project', async () => {
    vi.mocked(mockTx.deal.findFirst).mockResolvedValue({ id: 'deal-existing' });

    const result = await createDealFromQrScan({
      qrToken: TOKEN,
      projectId: PROJECT_ID,
      note: 'Follow-up at booth',
      builderUserId: BUILDER_USER_ID,
      companyId: COMPANY_ID,
    });

    expect(result).toEqual({ ok: true, deduped: true, dealId: 'deal-existing' });
    expect(mockTx.deal.create).not.toHaveBeenCalled();
    expect(mockTx.dealActivity.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          dealId: 'deal-existing',
          body: 'Follow-up at booth',
        }),
      }),
    );
  });

  it('creates a BUILDER_QR_SCAN deal with buyer snapshot when no duplicate exists', async () => {
    const result = await createDealFromQrScan({
      qrToken: TOKEN,
      projectId: PROJECT_ID,
      builderUserId: BUILDER_USER_ID,
      companyId: COMPANY_ID,
    });

    expect(result).toEqual({ ok: true, dealId: 'deal-new' });
    expect(mockTx.deal.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          companyId: COMPANY_ID,
          projectId: PROJECT_ID,
          stage: 'NEW_REQUEST',
          source: 'BUILDER_QR_SCAN',
          buyerUserId: BUYER_USER_ID,
          createdByUserId: BUILDER_USER_ID,
          contactEmail: 'scan.buyer@example.com',
        }),
      }),
    );
  });
});
