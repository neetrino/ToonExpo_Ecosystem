import { beforeEach, describe, expect, it, vi } from 'vitest';

import { hashQrToken } from './token';

const mockTx = {
  buyerProfile: { findUnique: vi.fn(), create: vi.fn() },
  qrCode: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
};

const mockFindFirst = vi.fn();

vi.mock('@toonexpo/db', () => ({
  prisma: {
    $transaction: vi.fn((callback: (tx: typeof mockTx) => Promise<unknown>) => callback(mockTx)),
    qrCode: { findFirst: (...args: unknown[]) => mockFindFirst(...args) },
    project: { findMany: vi.fn() },
    user: { findUnique: vi.fn() },
  },
}));

import { revokeBuyerQr } from './mutations';
import { resolveQrScan } from './resolve';

const USER_ID = 'user-buyer-1';
const PROFILE_ID = 'profile-1';
const QR_ID = 'qr-1';
const TOKEN = 'token-before-revoke';

describe('revokeBuyerQr → resolveQrScan', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockTx.buyerProfile.findUnique).mockResolvedValue({ id: PROFILE_ID });
    vi.mocked(mockTx.qrCode.findUnique).mockResolvedValue({
      id: QR_ID,
      revokedAt: null,
    });
    vi.mocked(mockTx.qrCode.update).mockResolvedValue({ id: QR_ID });
    // After revoke, active-token lookup (revokedAt: null) finds nothing.
    mockFindFirst.mockResolvedValue(null);
  });

  it('rejects resolve with invalid after revoke', async () => {
    const revokeResult = await revokeBuyerQr(USER_ID);
    expect(revokeResult).toEqual({ ok: true, qrCodeId: QR_ID, revoked: true });
    expect(mockTx.qrCode.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ revokedAt: expect.any(Date) }),
      }),
    );

    const resolveResult = await resolveQrScan(TOKEN, { userId: USER_ID, role: 'BUYER' });
    expect(resolveResult).toEqual({ kind: 'invalid' });
    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tokenHash: hashQrToken(TOKEN), revokedAt: null },
      }),
    );
  });
});
