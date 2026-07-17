const SECONDS_PER_DAY = 60 * 60 * 24;
const SESSION_MAX_AGE_DAYS = 30;

/** Database session lifetime in seconds (30 days). */
export const SESSION_MAX_AGE_SECONDS = SESSION_MAX_AGE_DAYS * SECONDS_PER_DAY;

/** HttpOnly session cookie (opaque DB sessionToken). */
export const SESSION_COOKIE_NAME = 'toonexpo.sid';

/** Readable CSRF double-submit cookie. */
export const CSRF_COOKIE_NAME = 'toonexpo.csrf';

/** Header the browser must echo with the CSRF cookie value. */
export const CSRF_HEADER_NAME = 'x-csrf-token';

/** Sliding-window auth limits (requests / minute). */
export const AUTH_RATE_LIMIT_MAX = {
  login: 10,
  register: 5,
} as const;

export const AUTH_RATE_LIMIT_WINDOW = '1 m' as const;

export type AuthRateLimitSurface = keyof typeof AUTH_RATE_LIMIT_MAX;
