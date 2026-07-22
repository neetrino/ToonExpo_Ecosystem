'use client';

import type { ReactNode } from 'react';

import { usePathname } from '@/i18n/navigation';
import { DesktopFluidFrame } from '@/shared/ui/desktop-fluid-frame';
import { SiteHeader } from '@/shared/ui/site-header';

type PublicChromeProps = {
  children: ReactNode;
};

/** Route prefixes that render their own shell (no public SiteHeader). */
const PORTAL_PREFIXES = ['/admin', '/builder', '/partner', '/checkin'] as const;

const isPortalRoute = (pathname: string): boolean => {
  return PORTAL_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
};

const isAuthRoute = (pathname: string): boolean => {
  return pathname === '/auth' || pathname.startsWith('/auth/');
};

const isHomeRoute = (pathname: string): boolean => {
  return pathname === '/' || pathname === '';
};

/**
 * Persistent public chrome — keeps SiteHeader mounted across navigations
 * so the bar does not remount/jump when switching Projects / Builders / etc.
 * Auth routes use AuthPageShell instead of the public header.
 * Home uses a transparent header so the hero photo sits under the bar;
 * other public pages use the same floating pill chrome as home-after-scroll.
 * Public pages use DesktopFluidFrame so desktop composition scales like ma-marie.
 */
export const PublicChrome = ({ children }: PublicChromeProps) => {
  const pathname = usePathname();
  const showPublicHeader = !isPortalRoute(pathname) && !isAuthRoute(pathname);
  const headerVariant = isHomeRoute(pathname) ? 'transparent' : 'solid';

  if (!showPublicHeader) {
    return children;
  }

  return (
    <DesktopFluidFrame>
      <SiteHeader variant={headerVariant} />
      {children}
    </DesktopFluidFrame>
  );
};
