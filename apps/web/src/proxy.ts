import { isAppLocale } from '@toonexpo/shared';
import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';

import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

/**
 * Locale negotiation only. Auth gates run in the browser (AreaAccessGate) because
 * Nest session cookies are on the API origin and are not visible to Next.js.
 */
/** ISO-ish locale codes (e.g. `de`, `fr-CA`) that are not in SUPPORTED_LOCALES. */
const LOCALE_CODE_PATTERN = /^[a-z]{2}(?:-[A-Za-z]{2})?$/;

/**
 * next-intl would otherwise treat `/de` as an unprefixed path and 307 to `/en/de`.
 * Unsupported locale prefixes should 404 instead.
 */
function unsupportedLocaleResponse(pathname: string): NextResponse | null {
  const first = pathname.split('/')[1] ?? '';
  if (!first || !LOCALE_CODE_PATTERN.test(first) || isAppLocale(first)) {
    return null;
  }
  return new NextResponse(null, { status: 404 });
}

export default function proxy(request: NextRequest): NextResponse {
  const blocked = unsupportedLocaleResponse(request.nextUrl.pathname);
  if (blocked) {
    return blocked;
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
