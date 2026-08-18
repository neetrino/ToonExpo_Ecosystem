/** ma-marie `HEADER_HOME_SCROLL_THRESHOLD_PX`. */
export const SCROLL_PILL_THRESHOLD_PX = 12;
/** ma-marie `HEADER_PILL_APPEAR_DURATION_MS`. */
export const PILL_APPEAR_MS = 500;
/** Burger dropdown open/close — one duration both ways for a even glide. */
export const BURGER_MENU_MS = 380;
/** Backdrop tracks the dropdown. */
export const BURGER_BACKDROP_MS = 320;
/** Inward nudge of logo / actions once the pill is visible. */
export const PILL_CONTENT_INSET_PX = 22;
/** Armenian: logo and edge icons sit closer to the pill sides. */
export const PILL_CONTENT_INSET_HY_PX = 10;
/** How far the pill pulls in from page-container edges. */
export const PILL_EDGE_INSET_CLASS = 'left-4 right-4 sm:left-5 sm:right-5 lg:left-6 lg:right-6';
/** Slightly wider pill for Armenian nav copy. */
export const PILL_EDGE_INSET_HY_CLASS = 'left-2 right-2 sm:left-3 sm:right-3 lg:left-3 lg:right-3';

const ARMENIAN_LOCALE = 'hy';

export const resolveHeaderPillLayout = (
  locale: string,
): { edgeInsetClass: string; contentInsetPx: number } =>
  locale === ARMENIAN_LOCALE
    ? { edgeInsetClass: PILL_EDGE_INSET_HY_CLASS, contentInsetPx: PILL_CONTENT_INSET_HY_PX }
    : { edgeInsetClass: PILL_EDGE_INSET_CLASS, contentInsetPx: PILL_CONTENT_INSET_PX };

/** Float gap above the pill — keeps pill height = navbar (h-16). */
export const PILL_TOP_OFFSET_CLASS = 'top-2';
export const HEADER_HEIGHT_CLASS = 'h-16';
/** Spacer under fixed pill chrome (safe-area + top inset + bar). */
export const HEADER_SPACER_CLASS = 'h-[calc(4.5rem+env(safe-area-inset-top,0px))]';

export type SiteHeaderNavHref =
  | '/apartments'
  | '/projects'
  | '/partners'
  | '/insights'
  | '/mortgage'
  | '/expo'
  | '/map';

export type SiteHeaderNavKey =
  | 'buy'
  | 'projects'
  | 'partners'
  | 'marketInsights'
  | 'mortgage'
  | 'venueMap'
  | 'geoMap';

export const SITE_HEADER_NAV_HREFS: ReadonlyArray<{
  href: SiteHeaderNavHref;
  key: SiteHeaderNavKey;
}> = [
  { href: '/apartments', key: 'buy' },
  { href: '/projects', key: 'projects' },
  { href: '/partners', key: 'partners' },
  { href: '/insights', key: 'marketInsights' },
  { href: '/mortgage', key: 'mortgage' },
  { href: '/expo', key: 'venueMap' },
  { href: '/map', key: 'geoMap' },
];

/** Mobile burger omits 3D map — bottom nav already has the Map tab. */
export const SITE_HEADER_MOBILE_NAV_HREFS = SITE_HEADER_NAV_HREFS.filter(
  (item) => item.href !== '/map',
);

export const isSiteHeaderNavActive = (pathname: string, href: SiteHeaderNavHref): boolean => {
  if (href === '/apartments') {
    return pathname === '/apartments' || pathname.startsWith('/apartments/');
  }
  if (href === '/projects') {
    return pathname === '/projects' || pathname.startsWith('/projects/');
  }
  if (href === '/partners') {
    return (
      pathname === '/partners' ||
      pathname.startsWith('/partners/') ||
      pathname === '/builders' ||
      pathname.startsWith('/builders/')
    );
  }
  if (href === '/map') {
    return pathname === '/map' || pathname.startsWith('/map/');
  }
  if (href === '/expo') {
    return pathname === '/expo' || pathname.startsWith('/expo/');
  }
  if (href === '/insights') {
    return pathname === '/insights' || pathname.startsWith('/insights/');
  }
  return pathname.startsWith(href);
};
