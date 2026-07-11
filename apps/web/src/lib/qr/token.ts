import { createHash, randomBytes } from 'node:crypto';

/** 32 random bytes → 256-bit opaque token (base64url). */
export const QR_TOKEN_BYTE_LENGTH = 32;

/**
 * SHA-256 hex of a high-entropy random token.
 * Argon2 is unnecessary here: tokens are not low-entropy secrets like passwords.
 */
export function hashQrToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

/** Generates an opaque URL-safe token with no personal data. */
export function generateQrToken(): string {
  return randomBytes(QR_TOKEN_BYTE_LENGTH).toString('base64url');
}
