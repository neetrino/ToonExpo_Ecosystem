import createMiddleware from 'next-intl/middleware';
import { type NextRequest, type NextResponse } from 'next/server';

import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

/** Request header read by `i18n/request.ts` to detect portal routes. */
const PATHNAME_HEADER = 'x-pathname';

/**
 * Injects `x-pathname` into Next.js middleware request-header forwarding.
 * next-intl already returns `NextResponse.next({ request: { headers } })`;
 * cloning the request before calling it does not reach Server Components.
 */
const withPathnameRequestHeader = (
  request: NextRequest,
  response: NextResponse,
): NextResponse => {
  const pathname = request.nextUrl.pathname;
  const override = response.headers.get('x-middleware-override-headers');
  const keys = override ? override.split(',').filter(Boolean) : [];

  if (!keys.includes(PATHNAME_HEADER)) {
    keys.push(PATHNAME_HEADER);
  }

  response.headers.set('x-middleware-override-headers', keys.join(','));
  response.headers.set(`x-middleware-request-${PATHNAME_HEADER}`, pathname);
  return response;
};

/**
 * Next.js 16 proxy entry (formerly middleware) for locale-aware routing.
 * Forwards pathname so `getRequestConfig` can apply the panel UI locale cookie.
 */
export default function proxy(request: NextRequest) {
  const response = handleI18nRouting(request);
  return withPathnameRequestHeader(request, response);
}

export const config = {
  matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)'],
};
