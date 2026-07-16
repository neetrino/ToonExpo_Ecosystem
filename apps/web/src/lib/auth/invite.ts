import { prisma, type Prisma } from '@toonexpo/db';

import {
  buildInviteIdentifier,
  generateInviteToken,
  hashInviteToken,
  inviteExpiresAt,
  parseInviteUserId,
} from './invite-token';

export type InviteErrorCode = 'invalidOrExpired';

export type ConsumeInviteResult = { ok: true } | { ok: false; error: InviteErrorCode };

class InvalidInviteError extends Error {}

/**
 * Creates a one-time set-password invite for `userId`, invalidating any
 * previous unused invite for the same user first. Returns the raw token —
 * only its SHA-256 hash is persisted (`VerificationToken.token`).
 */
export async function createAccountInvite(
  tx: Prisma.TransactionClient,
  userId: string,
): Promise<string> {
  const identifier = buildInviteIdentifier(userId);
  await tx.verificationToken.deleteMany({ where: { identifier } });

  const rawToken = generateInviteToken();
  await tx.verificationToken.create({
    data: { identifier, token: hashInviteToken(rawToken), expires: inviteExpiresAt() },
  });

  return rawToken;
}

/** Read-only validity check for rendering the invite page (does not consume). */
export async function previewAccountInvite(rawToken: string): Promise<ConsumeInviteResult> {
  const record = await prisma.verificationToken.findUnique({
    where: { token: hashInviteToken(rawToken) },
  });
  if (!isValidInviteRecord(record)) {
    return { ok: false, error: 'invalidOrExpired' };
  }
  return { ok: true };
}

/**
 * Validates + consumes an invite in one transaction (re-checked there to
 * avoid a preview/consume race), then sets the invitee's password hash.
 */
export async function consumeAccountInvite(
  rawToken: string,
  passwordHash: string,
): Promise<ConsumeInviteResult> {
  const tokenHash = hashInviteToken(rawToken);

  try {
    await prisma.$transaction(async (tx) => {
      const record = await tx.verificationToken.findUnique({ where: { token: tokenHash } });
      if (!isValidInviteRecord(record)) {
        throw new InvalidInviteError();
      }

      const userId = parseInviteUserId(record.identifier);
      if (!userId) {
        throw new InvalidInviteError();
      }

      await tx.verificationToken.delete({ where: { token: tokenHash } });
      await tx.user.update({ where: { id: userId }, data: { passwordHash } });
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof InvalidInviteError) {
      return { ok: false, error: 'invalidOrExpired' };
    }
    throw error;
  }
}

function isValidInviteRecord(
  record: { identifier: string; expires: Date } | null,
): record is { identifier: string; expires: Date } {
  return record !== null && record.expires.getTime() > Date.now();
}
