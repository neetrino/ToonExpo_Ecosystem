import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockTx = {
  buyerProfile: { findUnique: vi.fn(), create: vi.fn() },
  qrCode: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
};

vi.mock('@toonexpo/db', () => ({
  prisma: {
    $transaction: vi.fn((callback: (tx: typeof mockTx) => Promise<unknown>) => callback(mockTx)),
  },
}));

import { ensureBuyerQr, regenerateBuyerQr } from './mutations';

const USER_ID = 'user-buyer-1';
const PROFILE_ID = 'profile-1';
const QR_ID = 'qr-1';

describe('ensureBuyerQr', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockTx.buyerProfile.findUnique).mockResolvedValue({ id: PROFILE_ID });
    vi.mocked(mockTx.qrCode.findUnique).mockResolvedValue(null);
    vi.mocked(mockTx.qrCode.create).mockResolvedValue({ id: QR_ID });
  });

  it('creates a QR when none exists', async () => {
    const result = await ensureBuyerQr(USER_ID);

    expect(result.ok).toBe(true);
    if (result.ok && !result.revoked) {
      expect(result.qrCodeId).toBe(QR_ID);
      expect(result.token.length).toBeGreaterThan(20);
    }
    expect(mockTx.qrCode.create).toHaveBeenCalledTimes(1);
  });

  it('is idempotent — second call does not create', async () => {
    vi.mocked(mockTx.qrCode.findUnique).mockResolvedValue({
      id: QR_ID,
      token: 'existing-token',
      revokedAt: null,
    });

    const first = await ensureBuyerQr(USER_ID);
    const second = await ensureBuyerQr(USER_ID);

    expect(first).toEqual(second);
    expect(mockTx.qrCode.create).not.toHaveBeenCalled();
  });

  it('reports revoked without exposing a token', async () => {
    vi.mocked(mockTx.qrCode.findUnique).mockResolvedValue({
      id: QR_ID,
      token: 'old-token',
      revokedAt: new Date(),
    });

    const result = await ensureBuyerQr(USER_ID);

    expect(result).toEqual({ ok: true, qrCodeId: QR_ID, revoked: true });
    expect(mockTx.qrCode.create).not.toHaveBeenCalled();
  });
});

describe('regenerateBuyerQr', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockTx.buyerProfile.findUnique).mockResolvedValue({ id: PROFILE_ID });
    vi.mocked(mockTx.qrCode.findUnique).mockResolvedValue({ id: QR_ID });
    vi.mocked(mockTx.qrCode.update).mockResolvedValue({ id: QR_ID });
  });

  it('updates token on the existing row and clears revokedAt', async () => {
    const result = await regenerateBuyerQr(USER_ID);

    expect(result.ok).toBe(true);
    if (result.ok && !result.revoked) {
      expect(result.token).toBeTruthy();
    }
    expect(mockTx.qrCode.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: QR_ID },
        data: expect.objectContaining({ revokedAt: null }),
      }),
    );
    expect(mockTx.qrCode.create).not.toHaveBeenCalled();
  });
});
