'use client';

import type { ReactNode } from 'react';

import {
  MobileBottomNav,
  MobileBottomNavSpacer,
} from '@/features/catalog/components/mobile-bottom-nav';
import { usePathname } from '@/i18n/navigation';
import { isBuyerAccountShellPath } from '@/shared/ui/account-mobile-nav-controller';
import { DesktopFluidFrame } from '@/shared/ui/desktop-fluid-frame';
import { PageEnter } from '@/shared/ui/motion/page-enter';
import { SiteHeader } from '@/shared/ui/site-header';

type PublicChromeProps = {
  children: ReactNode;
};

/**
 * Route prefixes that render their own shell (no public SiteHeader).
 * Buyer AccountShell routes mount SiteHeader inside PortalShell.
 */
const PORTAL_PREFIXES = ['/admin', '/builder', '/partner'] as const;

const isPortalRoute = (pathname: string): boolean => {
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

const isProjectsListRoute = (pathname: string): boolean => {
  return pathname === '/projects';
};

const isBuildersListRoute = (pathname: string): boolean => {
  return pathname === '/builders';
};

const isBuilderDetailRoute = (pathname: string): boolean => {
  return /^\/builders\/[^/]+$/.test(pathname);
};

/** Building detail (`/projects/:id/buildings/:buildingId`) — cover under transparent header. */
const isBuildingDetailRoute = (pathname: string): boolean => {
  return /^\/projects\/[^/]+\/buildings\/[^/]+$/.test(pathname);
};

/**
 * Persistent public chrome — keeps SiteHeader mounted across navigations
 * so the bar does not remount/jump when switching Projects / Builders / etc.
 * Auth routes use AuthPageShell instead of the public header.
 * Home, partners/projects/builders list+detail, and building detail use a
 * transparent header so the hero sits under the bar; other public pages use the
 * same floating pill chrome as home-after-scroll.
 * Public, portal, and auth pages use DesktopFluidFrame so desktop composition
 * scales like ma-marie. Auth keeps AuthPageShell (no public SiteHeader).
 *
 * One MobileBottomNav for public + buyer + builder + admin profiles so the
 * selected thumb can glide (no remount snap) — same bar as user profile.
 */
export const PublicChrome = ({ children }: PublicChromeProps) => {
  const pathname = usePathname();
  const headerVariant =
    isHomeRoute(pathname) ||
    isProjectDetailRoute(pathname) ||
    isPartnerDetailRoute(pathname) ||
    isPartnersListRoute(pathname) ||
    isProjectsListRoute(pathname) ||
    isBuildersListRoute(pathname) ||
    isBuilderDetailRoute(pathname) ||
    isBuildingDetailRoute(pathname)
      ? 'transparent'
      : 'solid';

  if (isAuthRoute(pathname)) {
    return <DesktopFluidFrame>{children}</DesktopFluidFrame>;
  }

  const isPortal = isPortalRoute(pathname);
  const isAccountShell = isBuyerAccountShellPath(pathname);

  return (
    <DesktopFluidFrame stageClassName={isPortal ? undefined : 'min-h-svh bg-canvas'}>
      {isPortal || isAccountShell ? (
        children
      ) : (
        <>
          <SiteHeader variant={headerVariant} />
          <PageEnter>{children}</PageEnter>
        </>
      )}
      <MobileBottomNavSpacer />
      <MobileBottomNav />
    </DesktopFluidFrame>
  );
};
