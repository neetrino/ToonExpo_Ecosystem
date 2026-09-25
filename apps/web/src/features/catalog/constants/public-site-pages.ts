import type { PublicSitePageKey } from '@toonexpo/contracts';

import type { SiteHeaderNavHref } from '@/shared/ui/site-header.constants';

/** Maps primary header hrefs to platform page visibility keys. */
export const SITE_HEADER_HREF_PAGE_KEY: Record<SiteHeaderNavHref, PublicSitePageKey> = {
  '/apartments': 'apartments',
  '/projects': 'projects',
  '/partners': 'partners',
  '/insights': 'insights',
  '/mortgage': 'mortgage',
  '/expo': 'expo',
  '/map': 'map',
};

/**
 * Resolves which visibility key gates a public pathname (null = always allowed).
 */
export const resolvePublicPageKeyForPath = (pathname: string): PublicSitePageKey | null => {
  if (pathname === '/apartments' || pathname.startsWith('/apartments/')) {
    return 'apartments';
  }
  if (pathname === '/projects' || pathname.startsWith('/projects/')) {
    return 'projects';
  }
  if (
    pathname === '/partners' ||
    pathname.startsWith('/partners/') ||
    pathname === '/builders' ||
    pathname.startsWith('/builders/')
  ) {
    return 'partners';
  }
  if (pathname === '/insights' || pathname.startsWith('/insights/')) {
    return 'insights';
  }
  if (pathname === '/mortgage' || pathname.startsWith('/mortgage/')) {
    return 'mortgage';
  }
  if (pathname === '/expo' || pathname.startsWith('/expo/')) {
    return 'expo';
  }
  if (pathname === '/map' || pathname.startsWith('/map/')) {
    return 'map';
  }
  if (pathname === '/discover' || pathname.startsWith('/discover/')) {
    return 'discover';
  }
  return null;
};
