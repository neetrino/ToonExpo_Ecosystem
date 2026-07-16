import { isAppLocale } from '@toonexpo/shared';

import { ACCOUNT_PATH, LOGIN_PATH } from './constants';

const CALLBACK_MAX_LENGTH = 512;

/**
 * Accepts only same-app relative paths: `/{locale}/...` without protocol or `//`.
 * Prevents open redirects from favorite login CTA callbackUrl.
 */
export function safeAuthCallbackPath(
  raw: string | null | undefined,
  locale: string,
): string | null {
  if (!raw || raw.length > CALLBACK_MAX_LENGTH) {
    return null;
  }
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) {
    return null;
  }
  if (raw.includes('://') || raw.includes('\0') || raw.includes('..')) {
    return null;
  }

  const segments = raw.split('/');
  const pathLocale = segments[1] ?? '';
  if (!isAppLocale(pathLocale) || pathLocale !== locale) {
    return null;
  }

  return raw;
}

/** Login href that returns the user to `returnPath` after sign-in. */
export function loginHrefWithCallback(locale: string, returnPath: string): string {
  const safe = safeAuthCallbackPath(returnPath, locale);
  if (!safe) {
    return LOGIN_PATH;
  }
  return `${LOGIN_PATH}?callbackUrl=${encodeURIComponent(safe)}`;
}

/** Default post-auth destination when no safe callback is present. */
export function defaultAuthRedirect(locale: string): string {
  return `/${locale}${ACCOUNT_PATH}`;
}
