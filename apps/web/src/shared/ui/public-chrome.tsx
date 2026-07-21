'use client';

import type { ReactNode } from 'react';

import { usePathname } from '@/i18n/navigation';
import { SiteHeader } from '@/shared/ui/site-header';

type PublicChromeProps = {
  children: ReactNode;
};

/** Route prefixes that render their own shell (no public SiteHeader). */
const PORTAL_PREFIXES = ['/admin', '/builder', '/partner', '/checkin'] as const;

const isPortalRoute = (pathname: string): boolean => {
  return PORTAL_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
};

/**
 * Persistent public chrome — keeps SiteHeader mounted across navigations
 * so the bar does not remount/jump when switching Projects / Builders / etc.
 */
export const PublicChrome = ({ children }: PublicChromeProps) => {
  const pathname = usePathname();
  const showPublicHeader = !isPortalRoute(pathname);
  const headerVariant = pathname === '/' ? 'transparent' : 'solid';

  return (
    <>
      {showPublicHeader ? <SiteHeader variant={headerVariant} /> : null}
      {children}
    </>
  );
};
