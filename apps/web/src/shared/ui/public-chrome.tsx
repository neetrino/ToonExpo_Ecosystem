'use client';

import type { ReactNode } from 'react';

import { usePathname } from '@/i18n/navigation';
import { DesktopFluidFrame } from '@/shared/ui/desktop-fluid-frame';
import { SiteHeader } from '@/shared/ui/site-header';

type PublicChromeProps = {
  children: ReactNode;
};

/** Route prefixes that render their own shell (no public SiteHeader). */
const PORTAL_PREFIXES = [
  '/admin',
  '/builder',
  '/partner',
  '/checkin',
  '/settings',
  '/dashboard',
  '/favorites',
  '/requests',
] as const;

const isPortalRoute = (pathname: string): boolean => {
  if (pathname === '/qr') {
    return true;
  }
  return PORTAL_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
};

const isAuthRoute = (pathname: string): boolean => {
  return pathname === '/auth' || pathname.startsWith('/auth/');
};

const isHomeRoute = (pathname: string): boolean => {
  return pathname === '/' || pathname === '';
};

const isProjectDetailRoute = (pathname: string): boolean => {
  return /^\/projects\/[^/]+$/.test(pathname);
};

const isPartnerDetailRoute = (pathname: string): boolean => {
  return /^\/partners\/[^/]+$/.test(pathname);
};

const isPartnersListRoute = (pathname: string): boolean => {
  return pathname === '/partners';
};

/**
 * Persistent public chrome — keeps SiteHeader mounted across navigations
 * so the bar does not remount/jump when switching Projects / Builders / etc.
 * Auth routes use AuthPageShell instead of the public header.
 * Home, partners list/detail, and project detail use a transparent header so the
 * hero sits under the bar; other public pages use the same floating pill chrome
 * as home-after-scroll.
 * Public, portal, and auth pages use DesktopFluidFrame so desktop composition
 * scales like ma-marie. Auth keeps AuthPageShell (no public SiteHeader).
 */
export const PublicChrome = ({ children }: PublicChromeProps) => {
  const pathname = usePathname();
  const headerVariant =
    isHomeRoute(pathname) ||
    isProjectDetailRoute(pathname) ||
    isPartnerDetailRoute(pathname) ||
    isPartnersListRoute(pathname)
      ? 'transparent'
      : 'solid';

  if (isAuthRoute(pathname) || isPortalRoute(pathname)) {
    return <DesktopFluidFrame>{children}</DesktopFluidFrame>;
  }

  return (
    <DesktopFluidFrame>
      <SiteHeader variant={headerVariant} />
      {children}
    </DesktopFluidFrame>
  );
};
