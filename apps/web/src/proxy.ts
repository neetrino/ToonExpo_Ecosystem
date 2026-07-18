import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

/**
 * Next.js 16 proxy entry (formerly middleware) for locale-aware routing.
 */
export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
