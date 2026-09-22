import { isSupportedLocale, type SupportedLocale } from '@toonexpo/shared';

/** Cookie storing UI language for back-office portals (independent of site URL locale). */
export const PANEL_LOCALE_COOKIE = 'toonexpo_panel_locale';

/** Max age: 1 year. */
export const PANEL_LOCALE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

/** First path segment after `/{locale}` that uses the panel language cookie. */
export const PANEL_ROUTE_ROOTS = ['admin', 'builder', 'partner', 'staff'] as const;

export type PanelRouteRoot = (typeof PANEL_ROUTE_ROOTS)[number];

/**
 * Strips `/{locale}` prefix from a pathname (`/hy/admin` → `/admin`).
 */
export const pathWithoutLocalePrefix = (pathname: string): string => {
  const segments = pathname.split('/').filter(Boolean);
  const [maybeLocale, ...rest] = segments;
  if (maybeLocale && isSupportedLocale(maybeLocale)) {
    return rest.length > 0 ? `/${rest.join('/')}` : '/';
  }
  return pathname.startsWith('/') ? pathname : `/${pathname}`;
};

/**
 * True when the path is a back-office portal (admin / builder / partner / staff).
 */
export const isPanelPathname = (pathname: string): boolean => {
  const path = pathWithoutLocalePrefix(pathname);
  const root = path.split('/').filter(Boolean)[0];
  return (PANEL_ROUTE_ROOTS as readonly string[]).includes(root ?? '');
};

/**
 * Parses a panel-locale cookie value; returns null when missing/invalid.
 */
export const parsePanelLocaleCookie = (value: string | undefined | null): SupportedLocale | null => {
  if (!value || !isSupportedLocale(value)) {
    return null;
  }
  return value;
};

/**
 * Builds a `Set-Cookie` value for the panel locale preference.
 */
export const buildPanelLocaleCookie = (locale: SupportedLocale): string =>
  `${PANEL_LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${PANEL_LOCALE_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
