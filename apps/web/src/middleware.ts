import { DEFAULT_LOCALE, isAppLocale } from '@toonexpo/shared';
import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';

import { routing } from './i18n/routing';
import { getProtectedArea } from './lib/auth/access';
import { LOGIN_PATH, SESSION_COOKIE_NAMES } from './lib/auth/constants';

const intlMiddleware = createMiddleware(routing);

const LOCALE_SEGMENT_INDEX = 1;
const REST_SEGMENT_START = 2;

function hasSessionCookie(request: NextRequest): boolean {
  return SESSION_COOKIE_NAMES.some((name) => Boolean(request.cookies.get(name)?.value));
}

function splitLocale(pathname: string): { locale: string; rest: string } {
  const segments = pathname.split('/');
  const maybeLocale = segments[LOCALE_SEGMENT_INDEX] ?? '';
  if (isAppLocale(maybeLocale)) {
    return { locale: maybeLocale, rest: `/${segments.slice(REST_SEGMENT_START).join('/')}` };
  }
  return { locale: DEFAULT_LOCALE, rest: pathname };
}

/**
 * Runs next-intl first (locale negotiation/prefixing). For protected areas it
 * then performs a COARSE check: presence of a session cookie only. Real session
 * validation and role checks happen server-side in the route-group layouts
 * (defense in depth). The `api` path stays excluded via `config.matcher`, so
 * `/api/auth/*` continues to work.
 */
export default function middleware(request: NextRequest): NextResponse {
  const response = intlMiddleware(request);
  if (response.headers.has('location')) {
    return response;
  }

  const { locale, rest } = splitLocale(request.nextUrl.pathname);
  if (getProtectedArea(rest) && !hasSessionCookie(request)) {
    return NextResponse.redirect(new URL(`/${locale}${LOGIN_PATH}`, request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
