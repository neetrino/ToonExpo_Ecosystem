import { randomBytes } from 'node:crypto';

const CSRF_BYTE_LENGTH = 32;
/** Reject empty / trivially short values; issued tokens are base64url(32 bytes). */
const CSRF_TOKEN_MIN_LENGTH = 16;
const CSRF_TOKEN_MAX_LENGTH = 128;

/** True when the value is a non-empty CSRF token of plausible length. */
export function isValidCsrfToken(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length >= CSRF_TOKEN_MIN_LENGTH &&
    value.length <= CSRF_TOKEN_MAX_LENGTH
  );
}

/** Cryptographically strong CSRF token (base64url). */
export function createCsrfToken(): string {
  return randomBytes(CSRF_BYTE_LENGTH).toString('base64url');
}

/**
 * Reuse an existing valid CSRF cookie token; otherwise mint a new one.
 * Callers must Set-Cookie only when `setCookie` is true.
 */
export function issueOrReuseCsrfToken(existingCookie: unknown): {
  csrfToken: string;
  setCookie: boolean;
} {
  if (isValidCsrfToken(existingCookie)) {
    return { csrfToken: existingCookie, setCookie: false };
  }
  return { csrfToken: createCsrfToken(), setCookie: true };
}
