import { prisma } from '@toonexpo/db';

import type { QrEnsureResult } from './mutation-result';
import { generateQrToken, hashQrToken } from './token';

type TransactionClient = Omit<
  typeof prisma,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

async function ensureBuyerProfile(tx: TransactionClient, userId: string): Promise<string> {
  const existing = await tx.buyerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (existing) {
    return existing.id;
  }

  const created = await tx.buyerProfile.create({
    data: { userId },
    select: { id: true },
  });
  return created.id;
}

function issueTokenPair(): { token: string; tokenHash: string } {
  const token = generateQrToken();
  return { token, tokenHash: hashQrToken(token) };
}

/**
 * Idempotent get-or-create of an active buyer QR.
 * Raw token is returned for URL/QR rendering; only hash is used for lookups.
 */
export async function ensureBuyerQr(userId: string): Promise<QrEnsureResult> {
  if (!userId) {
    return { ok: false, errorKey: 'invalidInput' };
  }

  return prisma.$transaction(async (tx) => {
    const buyerProfileId = await ensureBuyerProfile(tx, userId);
    const existing = await tx.qrCode.findUnique({
      where: { buyerProfileId },
      select: { id: true, token: true, revokedAt: true },
    });

    if (existing?.revokedAt) {
      return { ok: true, qrCodeId: existing.id, revoked: true };
    }

    if (existing) {
      return {
        ok: true,
        qrCodeId: existing.id,
        token: existing.token,
        revoked: false,
      };
    }

    const { token, tokenHash } = issueTokenPair();
    const created = await tx.qrCode.create({
      data: { buyerProfileId, token, tokenHash },
      select: { id: true },
    });

    return { ok: true, qrCodeId: created.id, token, revoked: false };
  });
}

/**
 * Invalidates the current token and issues a new one on the same QrCode row
 * (1:1 with BuyerProfile). Keeps scan history attached to the row.
 */
export async function regenerateBuyerQr(userId: string): Promise<QrEnsureResult> {
  if (!userId) {
    return { ok: false, errorKey: 'invalidInput' };
  }

  return prisma.$transaction(async (tx) => {
    const buyerProfileId = await ensureBuyerProfile(tx, userId);
    const { token, tokenHash } = issueTokenPair();

    const existing = await tx.qrCode.findUnique({
      where: { buyerProfileId },
      select: { id: true },
    });

    if (existing) {
      await tx.qrCode.update({
        where: { id: existing.id },
        data: { token, tokenHash, revokedAt: null },
      });
      return { ok: true, qrCodeId: existing.id, token, revoked: false };
    }

    const created = await tx.qrCode.create({
      data: { buyerProfileId, token, tokenHash },
      select: { id: true },
    });
    return { ok: true, qrCodeId: created.id, token, revoked: false };
  });
}
