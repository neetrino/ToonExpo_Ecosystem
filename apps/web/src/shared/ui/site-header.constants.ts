/** ma-marie `HEADER_HOME_SCROLL_THRESHOLD_PX`. */
export const SCROLL_PILL_THRESHOLD_PX = 12;
/** ma-marie `HEADER_PILL_APPEAR_DURATION_MS`. */
export const PILL_APPEAR_MS = 500;
/** Burger panel enter — soft glide with room for staggered rows. */
export const BURGER_MENU_ENTER_MS = 420;
/** Burger panel exit — snappier so close doesn’t feel late. */
export const BURGER_MENU_EXIT_MS = 260;
/** Backdrop enter. */
export const BURGER_BACKDROP_ENTER_MS = 360;
/** Backdrop exit — tracks panel close. */
export const BURGER_BACKDROP_EXIT_MS = 220;
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
  '/apartments' | '/projects' | '/developments' | '/builders' | '/partners' | '/mortgage';

export type SiteHeaderNavKey =
  'buy' | 'projects' | 'newDevelopments' | 'builders' | 'partners' | 'mortgage';

export const SITE_HEADER_NAV_HREFS: ReadonlyArray<{
  href: SiteHeaderNavHref;
  key: SiteHeaderNavKey;
}> = [
  { href: '/apartments', key: 'buy' },
  { href: '/projects', key: 'projects' },
  { href: '/developments', key: 'newDevelopments' },
  { href: '/builders', key: 'builders' },
  { href: '/partners', key: 'partners' },
  { href: '/mortgage', key: 'mortgage' },
];

export const isSiteHeaderNavActive = (pathname: string, href: SiteHeaderNavHref): boolean => {
  if (href === '/apartments') {
    return pathname === '/apartments' || pathname.startsWith('/apartments/');
  }
  if (href === '/projects') {
    return pathname === '/projects' || pathname.startsWith('/projects/');
  }
  if (href === '/builders') {
    return (
      pathname === '/builders' ||
      pathname.startsWith('/builders/') ||
      pathname.startsWith('/developers/')
    );
  }
  return pathname.startsWith(href);
};
