import { CSRF_COOKIE_NAME } from '@toonexpo/contracts';

/** Default Nest session cookie name (httpOnly; mirrored for SSR Cookie header checks). */
export const DEFAULT_SESSION_COOKIE_NAME = 'toonexpo_session';

const readSessionCookieName = (): string =>
  process.env['SESSION_COOKIE_NAME']?.trim() || DEFAULT_SESSION_COOKIE_NAME;

const cookieHeaderHasName = (cookieHeader: string, name: string): boolean => {
  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith(`${name}=`) && trimmed.length > name.length + 1) {
      return true;
    }
  }

  return false;
};

/**
 * SSR / forwarded Cookie header: true when the httpOnly session cookie is present.
 */
export const hasSessionCookieInHeader = (cookieHeader?: string): boolean => {
  if (!cookieHeader) {
    return false;
  }

  return cookieHeaderHasName(cookieHeader, readSessionCookieName());
};

/**
 * Browser hint: CSRF cookie is readable (non-httpOnly) and is set with a session.
 * Guests skip `/auth/me` probes entirely.
 */
export const hasClientSessionHint = (): boolean => {
  if (typeof document === 'undefined') {
    return false;
  }

  return cookieHeaderHasName(document.cookie, CSRF_COOKIE_NAME);
};
