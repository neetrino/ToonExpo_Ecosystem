import { beforeEach, describe, expect, it, vi } from 'vitest';

import { hashQrToken } from './token';

const mockTransaction = vi.fn();
const mockQrFindFirst = vi.fn();
const mockEventFindFirst = vi.fn();
const mockCheckInFindUnique = vi.fn();
const mockCheckInCreate = vi.fn();
const mockScanLogFindFirst = vi.fn();
const mockScanLogCreate = vi.fn();
const mockUserFindUnique = vi.fn();

vi.mock('@toonexpo/db', () => ({
  prisma: {
    $transaction: (...args: unknown[]) => mockTransaction(...args),
    user: { findUnique: (...args: unknown[]) => mockUserFindUnique(...args) },
  },
  Prisma: {
    PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {
      code: string;
      meta?: { target?: string[] };
      constructor(message: string, { code }: { code: string; clientVersion?: string }) {
        super(message);
        this.code = code;
      }
    },
  },
}));

import { performEntranceCheckIn } from './check-in-mutations';
import { Prisma } from '@toonexpo/db';

const TOKEN = 'entrance-token';
const STAFF_ID = 'staff-1';
const QR_ID = 'qr-1';
const PROFILE_ID = 'profile-1';
const EVENT_ID = 'event-1';
const CHECK_IN_ID = 'checkin-1';
const CHECKED_IN_AT = new Date('2026-07-12T10:00:00.000Z');

function txClient() {
  return {
    qrCode: { findFirst: (...args: unknown[]) => mockQrFindFirst(...args) },
    exhibitionEvent: { findFirst: (...args: unknown[]) => mockEventFindFirst(...args) },
    checkIn: {
      findUnique: (...args: unknown[]) => mockCheckInFindUnique(...args),
      create: (...args: unknown[]) => mockCheckInCreate(...args),
    },
    qrScanLog: {
      findFirst: (...args: unknown[]) => mockScanLogFindFirst(...args),
      create: (...args: unknown[]) => mockScanLogCreate(...args),
    },
  };
}

describe('performEntranceCheckIn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserFindUnique.mockResolvedValue({ role: 'ENTRANCE_STAFF' });
    mockTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn(txClient()),
    );
    mockQrFindFirst.mockResolvedValue({ id: QR_ID, buyerProfileId: PROFILE_ID });
    mockEventFindFirst.mockResolvedValue({ id: EVENT_ID });
    mockScanLogFindFirst.mockResolvedValue(null);
    mockScanLogCreate.mockResolvedValue({ id: 'log-1' });
    mockCheckInFindUnique.mockResolvedValue(null);
    mockCheckInCreate.mockResolvedValue({ id: CHECK_IN_ID, checkedInAt: CHECKED_IN_AT });
  });

  it('creates a check-in and writes ENTRANCE_CHECKIN scan log', async () => {
    const result = await performEntranceCheckIn({
      qrToken: TOKEN,
      staffUserId: STAFF_ID,
    });

    expect(result).toEqual({
      ok: true,
      checkInId: CHECK_IN_ID,
      alreadyCheckedIn: false,
      checkedInAt: CHECKED_IN_AT,
    });
    expect(mockQrFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tokenHash: hashQrToken(TOKEN), revokedAt: null },
      }),
    );
    expect(mockScanLogCreate).toHaveBeenCalledWith({
      data: {
        qrCodeId: QR_ID,
        scannedByUserId: STAFF_ID,
        purpose: 'ENTRANCE_CHECKIN',
      },
    });
    expect(mockCheckInCreate).toHaveBeenCalled();
  });

  it('returns alreadyCheckedIn without creating another row', async () => {
    mockCheckInFindUnique.mockResolvedValue({
      id: CHECK_IN_ID,
      checkedInAt: CHECKED_IN_AT,
    });

    const result = await performEntranceCheckIn({
      qrToken: TOKEN,
      staffUserId: STAFF_ID,
      eventId: EVENT_ID,
    });

    expect(result).toEqual({
      ok: true,
      checkInId: CHECK_IN_ID,
      alreadyCheckedIn: true,
      checkedInAt: CHECKED_IN_AT,
    });
    expect(mockCheckInCreate).not.toHaveBeenCalled();
  });

  it('returns noActiveEvent when no ACTIVE event exists', async () => {
    mockEventFindFirst.mockResolvedValue(null);

    const result = await performEntranceCheckIn({
      qrToken: TOKEN,
      staffUserId: STAFF_ID,
    });

    expect(result).toEqual({ ok: false, errorKey: 'noActiveEvent' });
    expect(mockCheckInCreate).not.toHaveBeenCalled();
  });

  it('returns unauthorized when staff role is not ENTRANCE_STAFF', async () => {
    mockUserFindUnique.mockResolvedValue({ role: 'BUYER' });

    const result = await performEntranceCheckIn({
      qrToken: TOKEN,
      staffUserId: STAFF_ID,
    });

    expect(result).toEqual({ ok: false, errorKey: 'unauthorized' });
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('returns notFound for revoked QR tokens', async () => {
    mockQrFindFirst.mockResolvedValue(null);

    const result = await performEntranceCheckIn({
      qrToken: TOKEN,
      staffUserId: STAFF_ID,
    });

    expect(result).toEqual({ ok: false, errorKey: 'notFound' });
    expect(mockCheckInCreate).not.toHaveBeenCalled();
  });

  it('returns idempotent success on P2002 race after concurrent check-in', async () => {
    const raceError = new Prisma.PrismaClientKnownRequestError('Unique constraint', {
      code: 'P2002',
      clientVersion: 'test',
    });
    mockCheckInCreate.mockRejectedValueOnce(raceError);
    mockCheckInFindUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: CHECK_IN_ID, checkedInAt: CHECKED_IN_AT });

    const result = await performEntranceCheckIn({
      qrToken: TOKEN,
      staffUserId: STAFF_ID,
    });

    expect(result).toEqual({
      ok: true,
      checkInId: CHECK_IN_ID,
      alreadyCheckedIn: true,
      checkedInAt: CHECKED_IN_AT,
    });
  });
});
