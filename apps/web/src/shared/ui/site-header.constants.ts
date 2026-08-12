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
/** How far the pill pulls in from page-container edges. */
export const PILL_EDGE_INSET_CLASS = 'left-4 right-4 sm:left-5 sm:right-5 lg:left-6 lg:right-6';
/** Float gap above the pill — keeps pill height = navbar (h-16). */
export const PILL_TOP_OFFSET_CLASS = 'top-2';
export const HEADER_HEIGHT_CLASS = 'h-16';
/** Spacer under fixed pill chrome (safe-area + top inset + bar). */
export const HEADER_SPACER_CLASS = 'h-[calc(4.5rem+env(safe-area-inset-top,0px))]';

export type SiteHeaderNavHref =
  | '/apartments'
  | '/projects'
  | '/builders'
  | '/partners'
  | '/insights'
  | '/mortgage'
  | '/expo'
  | '/map';

export type SiteHeaderNavKey =
  | 'buy'
  | 'projects'
  | 'builders'
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
  { href: '/builders', key: 'builders' },
  { href: '/partners', key: 'partners' },
  { href: '/insights', key: 'marketInsights' },
  { href: '/mortgage', key: 'mortgage' },
  { href: '/expo', key: 'venueMap' },
  { href: '/map', key: 'geoMap' },
];

export const isSiteHeaderNavActive = (pathname: string, href: SiteHeaderNavHref): boolean => {
  if (href === '/apartments') {
    return pathname === '/apartments' || pathname.startsWith('/apartments/');
  }
  if (href === '/projects') {
    return pathname === '/projects' || pathname.startsWith('/projects/');
  }
  if (href === '/builders') {
    return pathname === '/builders' || pathname.startsWith('/builders/');
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
