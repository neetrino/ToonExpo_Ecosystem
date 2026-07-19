import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Derives a session-bound CSRF token (HMAC-SHA256, base64url).
 */
export const createCsrfToken = (
  sessionToken: string,
  secret: string,
): string =>
  createHmac("sha256", secret).update(sessionToken).digest("base64url");

/**
 * Constant-time verification of a provided CSRF token against the session binding.
 */
export const verifyCsrfToken = (
  provided: string,
  sessionToken: string,
  secret: string,
): boolean => {
  const expected = createCsrfToken(sessionToken, secret);
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, expectedBuffer);
};
