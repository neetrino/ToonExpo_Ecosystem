import type { Prisma } from '@toonexpo/db';

import {
  buildInviteIdentifier,
  generateInviteToken,
  hashInviteToken,
  inviteExpiresAt,
} from './invite-token';

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
