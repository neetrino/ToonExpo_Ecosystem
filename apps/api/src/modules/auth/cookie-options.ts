import type { CookieOptions } from 'express';

import type { ApiEnv } from '../../common/env';
import { SESSION_MAX_AGE_SECONDS } from './auth.constants';

const MS_PER_SECOND = 1000;

/**
 * Resolve SameSite for cross-deploy auth.
 * - Same hostname (e.g. localhost:3000 → localhost:4000): Lax
 * - Different hosts (Vercel → Cloud Run): None (requires Secure)
 * - Explicit COOKIE_SAME_SITE wins when set
 */
export function resolveCookieSameSite(env: ApiEnv): 'lax' | 'none' | 'strict' {
  if (env.COOKIE_SAME_SITE) {
    return env.COOKIE_SAME_SITE;
  }
  try {
    const appHost = new URL(env.APP_URL).hostname;
    const apiHost = new URL(env.API_URL).hostname;
    if (appHost === apiHost) {
      return 'lax';
    }
    return 'none';
  } catch {
    return 'lax';
  }
}

function baseCookieOptions(
  env: ApiEnv,
): Pick<CookieOptions, 'secure' | 'sameSite' | 'path' | 'domain'> {
  const sameSite = resolveCookieSameSite(env);
  const secure = env.NODE_ENV === 'production' || sameSite === 'none';

  return {
    secure,
    sameSite,
    path: '/',
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  };
}

/**
 * Session cookie options for browser → Nest (direct, no Next proxy).
 * HttpOnly session; COOKIE_DOMAIN should stay unset for host-only cookies.
 */
export function buildSessionCookieOptions(env: ApiEnv): CookieOptions {
  return {
    httpOnly: true,
    ...baseCookieOptions(env),
    maxAge: SESSION_MAX_AGE_SECONDS * MS_PER_SECOND,
  };
}

/** CSRF double-submit cookie (readable by JS on the API origin). */
export function buildCsrfCookieOptions(env: ApiEnv): CookieOptions {
  return {
    httpOnly: false,
    ...baseCookieOptions(env),
    maxAge: SESSION_MAX_AGE_SECONDS * MS_PER_SECOND,
  };
}

/** Active-company cookie (readable by Nest on subsequent credentialed requests). */
export function buildActiveCompanyCookieOptions(env: ApiEnv): CookieOptions {
  const EIGHT_HOURS_SECONDS = 8 * 60 * 60;
  return {
    httpOnly: true,
    ...baseCookieOptions(env),
    maxAge: EIGHT_HOURS_SECONDS * MS_PER_SECOND,
  };
}
