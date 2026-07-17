const SECONDS_PER_DAY = 60 * 60 * 24;
const SESSION_MAX_AGE_DAYS = 30;

/** Database session lifetime in seconds (30 days). */
export const SESSION_MAX_AGE_SECONDS = SESSION_MAX_AGE_DAYS * SECONDS_PER_DAY;

/**
 * NestJS session cookie. Middleware checks presence only; Nest validates the token.
 */
export const SESSION_COOKIE_NAMES = ['toonexpo.sid'] as const;

export const SESSION_COOKIE_NAME = SESSION_COOKIE_NAMES[0];

/** Locale-relative route used to send unauthenticated users to sign in. */
export const LOGIN_PATH = '/login';

/** Locale-relative route users land on after a successful sign in / registration. */
export const ACCOUNT_PATH = '/account';
