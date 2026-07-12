import { checkInInputSchema, type CheckInInput } from '@toonexpo/contracts';
import { hashQrToken } from './token';

import { prisma, Prisma } from '@toonexpo/db';

const MILLISECONDS_PER_MINUTE = 60 * 1000;
const ENTRANCE_SCAN_LOG_DEBOUNCE_MINUTES = 5;
const ENTRANCE_SCAN_LOG_DEBOUNCE_MS = ENTRANCE_SCAN_LOG_DEBOUNCE_MINUTES * MILLISECONDS_PER_MINUTE;

const UNIQUE_CONSTRAINT_ERROR = 'P2002';

export type CheckInMutationErrorKey =
  'unauthorized' | 'invalidInput' | 'notFound' | 'noActiveEvent' | 'alreadyCheckedIn';

export type CheckInMutationResult =
  | { ok: true; checkInId: string; alreadyCheckedIn: boolean; checkedInAt: Date }
  | { ok: false; errorKey: CheckInMutationErrorKey };

type TransactionClient = Omit<
  typeof prisma,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export type PerformCheckInParams = CheckInInput & {
  staffUserId: string;
};

async function resolveActiveQr(
  tx: TransactionClient,
  token: string,
): Promise<{ qrCodeId: string; buyerProfileId: string } | null> {
  const tokenHash = hashQrToken(token);
  const qr = await tx.qrCode.findFirst({
    where: { tokenHash, revokedAt: null },
    select: { id: true, buyerProfileId: true },
  });
  if (!qr) {
    return null;
  }
  return { qrCodeId: qr.id, buyerProfileId: qr.buyerProfileId };
}

async function resolveEventId(
  tx: TransactionClient,
  eventId: string | undefined,
): Promise<string | null> {
  if (eventId) {
    const event = await tx.exhibitionEvent.findFirst({
      where: { id: eventId, status: 'ACTIVE' },
      select: { id: true },
    });
    return event?.id ?? null;
  }

  const active = await tx.exhibitionEvent.findFirst({
    where: { status: 'ACTIVE' },
    orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
    select: { id: true },
  });
  return active?.id ?? null;
}

async function logEntranceScan(
  tx: TransactionClient,
  params: { qrCodeId: string; scannedByUserId: string },
): Promise<void> {
  const since = new Date(Date.now() - ENTRANCE_SCAN_LOG_DEBOUNCE_MS);
  const recent = await tx.qrScanLog.findFirst({
    where: {
      qrCodeId: params.qrCodeId,
      scannedByUserId: params.scannedByUserId,
      purpose: 'ENTRANCE_CHECKIN',
      scannedAt: { gte: since },
    },
    select: { id: true },
  });
  if (recent) {
    return;
  }

  await tx.qrScanLog.create({
    data: {
      qrCodeId: params.qrCodeId,
      scannedByUserId: params.scannedByUserId,
      purpose: 'ENTRANCE_CHECKIN',
    },
  });
}

async function runCheckInTransaction(
  tx: TransactionClient,
  staffUserId: string,
  input: CheckInInput,
): Promise<CheckInMutationResult> {
  const qr = await resolveActiveQr(tx, input.qrToken);
  if (!qr) {
    return { ok: false, errorKey: 'notFound' };
  }

  const eventId = await resolveEventId(tx, input.eventId);
  if (!eventId) {
    return { ok: false, errorKey: 'noActiveEvent' };
  }

  await logEntranceScan(tx, { qrCodeId: qr.qrCodeId, scannedByUserId: staffUserId });

  const existing = await tx.checkIn.findUnique({
    where: {
      eventId_buyerProfileId: {
        eventId,
        buyerProfileId: qr.buyerProfileId,
      },
    },
    select: { id: true, checkedInAt: true },
  });

  if (existing) {
    return {
      ok: true,
      checkInId: existing.id,
      alreadyCheckedIn: true,
      checkedInAt: existing.checkedInAt,
    };
  }

  try {
    const created = await tx.checkIn.create({
      data: {
        eventId,
        buyerProfileId: qr.buyerProfileId,
        qrCodeId: qr.qrCodeId,
        checkedInByUserId: staffUserId,
        status: 'ALLOWED',
      },
      select: { id: true, checkedInAt: true },
    });
    return {
      ok: true,
      checkInId: created.id,
      alreadyCheckedIn: false,
      checkedInAt: created.checkedInAt,
    };
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === UNIQUE_CONSTRAINT_ERROR
    ) {
      const raced = await tx.checkIn.findUnique({
        where: {
          eventId_buyerProfileId: {
            eventId,
            buyerProfileId: qr.buyerProfileId,
          },
        },
        select: { id: true, checkedInAt: true },
      });
      if (raced) {
        return {
          ok: true,
          checkInId: raced.id,
          alreadyCheckedIn: true,
          checkedInAt: raced.checkedInAt,
        };
      }
    }
    throw error;
  }
}

/**
 * Records entrance check-in for the active (or specified) event.
 * Duplicate per event+buyer returns idempotent success with alreadyCheckedIn.
 * Always writes ENTRANCE_CHECKIN scan log (debounced) — no CRM side effects.
 */
export async function performEntranceCheckIn(
  raw: PerformCheckInParams,
): Promise<CheckInMutationResult> {
  if (!raw.staffUserId) {
    return { ok: false, errorKey: 'unauthorized' };
  }

  const staff = await prisma.user.findUnique({
    where: { id: raw.staffUserId },
    select: { role: true },
  });
  if (!staff || staff.role !== 'ENTRANCE_STAFF') {
    return { ok: false, errorKey: 'unauthorized' };
  }

  const parsed = checkInInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, errorKey: 'invalidInput' };
  }

  return prisma.$transaction((tx) => runCheckInTransaction(tx, raw.staffUserId, parsed.data));
}
