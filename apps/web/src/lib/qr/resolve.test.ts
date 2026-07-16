import { beforeEach, describe, expect, it, vi } from 'vitest';

import { hashQrToken } from './token';

const mockFindFirst = vi.fn();
const mockProjectFindMany = vi.fn();
const mockUserFindUnique = vi.fn();

vi.mock('@toonexpo/db', () => ({
  prisma: {
    qrCode: { findFirst: (...args: unknown[]) => mockFindFirst(...args) },
    project: { findMany: (...args: unknown[]) => mockProjectFindMany(...args) },
    user: { findUnique: (...args: unknown[]) => mockUserFindUnique(...args) },
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
  buyerProfile: { userId: BUYER_USER_ID },
};

const BUYER_CONTACT = {
  id: BUYER_USER_ID,
  name: 'Anna Buyer',
  email: 'anna@example.com',
  phone: '+37491111111',
};

describe('resolveQrScan', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindFirst.mockResolvedValue(ACTIVE_QR);
    mockProjectFindMany.mockResolvedValue([{ id: 'project-1', name: 'Demo' }]);
    mockUserFindUnique.mockResolvedValue(BUYER_CONTACT);
  });

  it('returns invalid for revoked or missing tokens', async () => {
    mockFindFirst.mockResolvedValue(null);

    const result = await resolveQrScan(TOKEN, {});

    expect(result).toEqual({ kind: 'invalid' });
    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tokenHash: hashQrToken(TOKEN), revokedAt: null },
        select: {
          id: true,
          buyerProfile: { select: { userId: true } },
        },
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
    expect(mockUserFindUnique).not.toHaveBeenCalled();
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
    expect(mockUserFindUnique).toHaveBeenCalledWith({
      where: { id: BUYER_USER_ID },
      select: { id: true, name: true, email: true, phone: true },
    });
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
    expect(mockUserFindUnique).not.toHaveBeenCalled();
    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        select: {
          id: true,
          buyerProfile: { select: { userId: true } },
        },
      }),
    );
  });

  it('returns entrance branch with name only — no phone/email fields', async () => {
    mockUserFindUnique.mockResolvedValue({ id: BUYER_USER_ID, name: 'Anna Buyer' });

    const result = await resolveQrScan(TOKEN, {
      userId: 'entrance-1',
      role: 'ENTRANCE_STAFF',
    });

    expect(result.kind).toBe('entrance');
    if (result.kind === 'entrance') {
      expect(result.buyer).toEqual({ userId: BUYER_USER_ID, name: 'Anna Buyer' });
      expect(result.buyer).not.toHaveProperty('email');
      expect(result.buyer).not.toHaveProperty('phone');
    }
    expect(toPublicResolveShape(result)).toEqual({
      kind: 'entrance',
      hasBuyerPii: true,
      hasContactPii: false,
    });
    expect(mockUserFindUnique).toHaveBeenCalledWith({
      where: { id: BUYER_USER_ID },
      select: { id: true, name: true },
    });
  });
});
