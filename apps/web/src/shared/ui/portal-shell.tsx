'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { BrandLogo } from '@/shared/ui/brand-logo';
import { IconButton } from '@/shared/ui/icon-button';
import { LocaleSwitcher } from '@/shared/ui/locale-switcher';
import { SiteHeader } from '@/shared/ui/site-header';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type PortalShellProps = {
  brandHref: '/builder' | '/admin' | '/partner' | '/settings' | '/dashboard';
  badge: string;
  userEmail: string;
  profileLabel: string;
  /** Account / settings destination in the light portal header. */
  profileHref?: '/dashboard' | '/builder/settings' | '/partner/settings' | '/admin/settings';
  navLabel: string;
  children: ReactNode;
  sidebar: ReactNode;
  /**
   * `rail` — floating dark sidebar + public SiteHeader (admin / account).
   * Default keeps the light portal card chrome.
   */
  variant?: 'default' | 'rail';
  /** Optional label shown beside the mobile menu control (rail). */
  mobileHeader?: ReactNode;
};

/**
 * SiteHeader pill chrome is ~4.5rem (top inset + h-16).
 * Sidebar starts one gap below that; content mask extends a bit lower so
 * scrolled main content begins disappearing under the header earlier.
 */
const RAIL_CHROME_TOP_CLASS = 'top-[5.5rem]';
const RAIL_CHROME_HEIGHT_CLASS = 'h-[calc(100dvh-5.5rem)]';
/** Header spacer band under the fixed pill. */
const RAIL_HEADER_BAND_HEIGHT_CLASS = 'h-[4.5rem]';
/** Header band + light extra clip so content vanishes just below the header edge. */
const RAIL_CONTENT_MASK_HEIGHT_CLASS = 'h-[5.125rem]';
const RAIL_SIDEBAR_WIDTH_CLASS = 'w-72';
const RAIL_ROW_GAP_CLASS = 'md:pt-4';

/**
 * Shared portal chrome: top bar + desktop sidebar + mobile drawer.
 */
export const PortalShell = ({
  brandHref,
  badge,
  userEmail,
  profileLabel,
  profileHref = '/dashboard',
  navLabel,
  children,
  sidebar,
  variant = 'default',
  mobileHeader,
}: PortalShellProps) => {
  const t = useTranslations('Nav');
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isRail = variant === 'rail';

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) {
      return;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  return (
    <div className="min-h-screen bg-background">
      {isRail ? <SiteHeader /> : null}

      {isRail ? (
        <>
          {/*
            Full-width band under the floating header (stops at sidebar top),
            plus a slightly lower main-column clip so content starts vanishing
            below the header edge — never over the sidebar.
          */}
          <div
            className={cn(
              'pointer-events-none fixed inset-x-0 top-0 z-[var(--z-sticky)] bg-background',
              RAIL_HEADER_BAND_HEIGHT_CLASS,
            )}
            aria-hidden
          />
          <div
            className={cn(
              'pointer-events-none fixed top-0 right-0 z-[var(--z-sticky)] bg-background',
              'left-0 md:left-72',
              RAIL_CONTENT_MASK_HEIGHT_CLASS,
            )}
            aria-hidden
          />
          <aside
            className={cn(
              'fixed bottom-0 left-0 z-[var(--z-sticky)] hidden',
              RAIL_CHROME_TOP_CLASS,
              RAIL_SIDEBAR_WIDTH_CLASS,
              'md:block',
            )}
          >
            <div
              className={cn(
                'flex h-full flex-col rounded-tr-[2.5rem] rounded-br-[2.5rem] bg-brand-secondary p-4 shadow-md',
                RAIL_CHROME_HEIGHT_CLASS,
              )}
            >
              {sidebar}
            </div>
          </aside>
        </>
      ) : null}

      {!isRail ? (
        <header className="sticky top-0 z-[var(--z-header)] border-b border-border bg-surface-elevated/95 backdrop-blur-md">
          <div className="page-container flex items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-2">
              <IconButton
                label={t('menu')}
                className="md:hidden"
                variant="outline"
                size="sm"
                onClick={() => setDrawerOpen((open) => !open)}
                aria-expanded={drawerOpen}
                aria-controls="portal-mobile-nav"
              >
                {drawerOpen ? (
                  <X className="size-4" aria-hidden />
                ) : (
                  <Menu className="size-4" aria-hidden />
                )}
              </IconButton>
              <BrandLogo href={brandHref} badge={badge} size="sm" />
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden max-w-48 truncate text-sm text-ink-secondary lg:inline">
                {userEmail}
              </span>
              <LocaleSwitcher />
              <Link
                href={profileHref}
                className="text-sm font-medium text-ink-secondary transition-colors hover:text-ink"
              >
                {profileLabel}
              </Link>
            </div>
          </div>
        </header>
      ) : null}

      {isRail ? (
        <div className={cn('flex flex-col gap-8 md:flex-row md:gap-8 md:py-0', RAIL_ROW_GAP_CLASS)}>
          <div className="page-container flex items-center gap-3 md:hidden">
            <IconButton
              label={navLabel}
              variant="outline"
              size="sm"
              onClick={() => setDrawerOpen(true)}
              aria-expanded={drawerOpen}
              aria-controls="portal-mobile-nav"
            >
              <Menu className="size-4" aria-hidden />
            </IconButton>
            {mobileHeader}
          </div>
          <div className={cn('hidden shrink-0 md:block', RAIL_SIDEBAR_WIDTH_CLASS)} aria-hidden />
          <main className="relative z-[var(--z-base)] page-container min-w-0 flex-1 py-6 md:py-8">
            {children}
          </main>
        </div>
      ) : (
        <div className="page-container flex flex-col gap-8 py-6 md:flex-row md:py-8">
          <aside className="hidden w-56 shrink-0 md:block">
            <div className="sticky top-24 rounded-md border border-border bg-surface-elevated p-3 shadow-xs">
              {sidebar}
            </div>
          </aside>
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      )}

      {drawerOpen ? (
        <div className="fixed inset-0 z-[var(--z-overlay)] md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/40"
            aria-label={t('menu')}
            onClick={() => setDrawerOpen(false)}
          />
          <nav
            id="portal-mobile-nav"
            aria-label={navLabel}
            className={cn(
              'absolute inset-y-0 left-0 flex w-[min(100%,20rem)] flex-col p-4 shadow-lg',
              'animate-[portal-drawer-in_var(--duration-base)_var(--ease-out-premium)]',
              isRail ? 'bg-brand-secondary' : 'border-r border-border bg-surface-elevated',
            )}
          >
            <div className="mb-4 flex items-center justify-between">
              <BrandLogo href={brandHref} badge={badge} size="sm" inverted={isRail} />
              <IconButton
                label={t('menu')}
                size="sm"
                className={isRail ? 'text-on-dark hover:bg-on-dark/10' : undefined}
                onClick={() => setDrawerOpen(false)}
              >
                <X className="size-4" aria-hidden />
              </IconButton>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">{sidebar}</div>
          </nav>
        </div>
      ) : null}
    </div>
  );
};
