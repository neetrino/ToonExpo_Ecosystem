import type { CookieOptions } from 'express';

import type { ApiEnv } from '../../common/env';
import { SESSION_MAX_AGE_SECONDS } from './auth.constants';

const MS_PER_SECOND = 1000;

/**
 * Cookie options for cross-deploy auth.
 * - Same-origin rewrite (recommended): SameSite=Lax
 * - Direct browser → Cloud Run: SameSite=None + Secure + optional COOKIE_DOMAIN
 */
export function buildSessionCookieOptions(env: ApiEnv): CookieOptions {
  const sameSite = env.COOKIE_SAME_SITE;
  const secure = env.NODE_ENV === 'production' || sameSite === 'none';

  return {
    httpOnly: true,
    secure,
    sameSite,
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS * MS_PER_SECOND,
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  };
}

export function buildCsrfCookieOptions(env: ApiEnv): CookieOptions {
  const sameSite = env.COOKIE_SAME_SITE;
  const secure = env.NODE_ENV === 'production' || sameSite === 'none';

  return {
    httpOnly: false,
    secure,
    sameSite,
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS * MS_PER_SECOND,
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  };
}
