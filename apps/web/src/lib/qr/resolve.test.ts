import { beforeEach, describe, expect, it, vi } from 'vitest';

import { hashQrToken } from './token';

const mockFindFirst = vi.fn();
const mockProjectFindMany = vi.fn();

vi.mock('@toonexpo/db', () => ({
  prisma: {
    qrCode: { findFirst: (...args: unknown[]) => mockFindFirst(...args) },
    project: { findMany: (...args: unknown[]) => mockProjectFindMany(...args) },
  },
}));

import { resolveQrScan, toPublicResolveShape } from './resolve';

const TOKEN = 'scan-resolve-token';
const QR_ID = 'qr-resolve-1';
const BUYER_USER_ID = 'buyer-user-1';
const BUILDER_USER_ID = 'builder-user-1';
const COMPANY_ID = 'company-1';

const ACTIVE_QR = {
  id: QR_ID,
  buyerProfile: {
    userId: BUYER_USER_ID,
    user: {
      id: BUYER_USER_ID,
      name: 'Anna Buyer',
      email: 'anna@example.com',
      phone: '+37491111111',
    },
  },
};

describe('resolveQrScan', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindFirst.mockResolvedValue(ACTIVE_QR);
    mockProjectFindMany.mockResolvedValue([{ id: 'project-1', name: 'Demo' }]);
  });

  it('returns invalid for revoked or missing tokens', async () => {
    mockFindFirst.mockResolvedValue(null);

    const result = await resolveQrScan(TOKEN, {});

    expect(result).toEqual({ kind: 'invalid' });
    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tokenHash: hashQrToken(TOKEN), revokedAt: null },
      }),
    );
  });

  it('returns owner branch for the buyer who owns the QR', async () => {
    const result = await resolveQrScan(TOKEN, {
      userId: BUYER_USER_ID,
      role: 'BUYER',
    });

    expect(result).toEqual({ kind: 'owner', qrCodeId: QR_ID });
    expect(toPublicResolveShape(result).hasBuyerPii).toBe(false);
  });

  it('returns builder action data with buyer contact when builder session is present', async () => {
    const result = await resolveQrScan(TOKEN, {
      userId: BUILDER_USER_ID,
      role: 'BUILDER',
      companyId: COMPANY_ID,
    });

    expect(result.kind).toBe('builder');
    if (result.kind === 'builder') {
      expect(result.buyer.email).toBe('anna@example.com');
      expect(result.projects).toHaveLength(1);
    }
    expect(toPublicResolveShape(result).hasBuyerPii).toBe(true);
  });

  it('returns limited shape without PII for foreign roles and anonymous', async () => {
    const anonymous = await resolveQrScan(TOKEN, {});
    const partner = await resolveQrScan(TOKEN, {
      userId: 'partner-1',
      role: 'PARTNER',
    });

    expect(anonymous).toEqual({ kind: 'limited', qrCodeId: QR_ID });
    expect(partner).toEqual({ kind: 'limited', qrCodeId: QR_ID });
    expect(toPublicResolveShape(anonymous).hasBuyerPii).toBe(false);
    expect(toPublicResolveShape(partner).hasBuyerPii).toBe(false);
  });
});
