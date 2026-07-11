const SECONDS_PER_DAY = 60 * 60 * 24;
const SESSION_MAX_AGE_DAYS = 30;

/** Database session lifetime in seconds (30 days). */
export const SESSION_MAX_AGE_SECONDS = SESSION_MAX_AGE_DAYS * SECONDS_PER_DAY;

/**
 * Auth.js session cookie names. The `__Secure-` prefixed variant is used when
 * cookies are served over HTTPS (production). Middleware checks both because it
 * cannot know the runtime scheme ahead of time.
 */
export const SESSION_COOKIE_NAMES = [
  'authjs.session-token',
  '__Secure-authjs.session-token',
] as const;

/** Locale-relative route used to send unauthenticated users to sign in. */
export const LOGIN_PATH = '/login';

/** Locale-relative route users land on after a successful sign in / registration. */
export const ACCOUNT_PATH = '/account';
