import { createHash, randomBytes } from 'node:crypto';

/** One-time set-password invite lifetime (Sprint 7.2 confirmed default). */
export const INVITE_TOKEN_TTL_HOURS = 48;

const INVITE_TOKEN_BYTES = 32;
const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;

/** `VerificationToken.identifier` namespace for account-invite rows. */
export const INVITE_IDENTIFIER_PREFIX = 'invite:';

/** Cryptographically random raw token — never persisted, only emailed. */
export function generateInviteToken(): string {
  return randomBytes(INVITE_TOKEN_BYTES).toString('hex');
}

/** SHA-256 hash stored in `VerificationToken.token` instead of the raw value. */
export function hashInviteToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}

export function buildInviteIdentifier(userId: string): string {
  return `${INVITE_IDENTIFIER_PREFIX}${userId}`;
}

/** Extracts the userId from an invite identifier, or null when malformed. */
export function parseInviteUserId(identifier: string): string | null {
  if (!identifier.startsWith(INVITE_IDENTIFIER_PREFIX)) {
    return null;
  }
  return identifier.slice(INVITE_IDENTIFIER_PREFIX.length);
}

export function inviteExpiresAt(from: Date = new Date()): Date {
  return new Date(from.getTime() + INVITE_TOKEN_TTL_HOURS * MILLISECONDS_PER_HOUR);
}
