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
  brandHref: '/builder' | '/admin' | '/partner';
  badge: string;
  userEmail: string;
  profileLabel: string;
  navLabel: string;
  children: ReactNode;
  sidebar: ReactNode;
  /**
   * `rail` — floating dark sidebar + public SiteHeader (admin).
   * Default keeps the light portal card chrome.
   */
  variant?: 'default' | 'rail';
};

/** Matches SiteHeader solid spacer (`top-3` + bar) plus a small gap below the header. */
const SITE_HEADER_OFFSET_CLASS = 'top-[6.25rem]';
const SITE_HEADER_RAIL_HEIGHT_CLASS = 'h-[calc(100vh-6.25rem)]';
const SITE_HEADER_RAIL_TOP_GAP_CLASS = 'mt-4';

/**
 * Shared portal chrome: top bar + desktop sidebar + mobile drawer.
 */
export const PortalShell = ({
  brandHref,
  badge,
  userEmail,
  profileLabel,
  navLabel,
  children,
  sidebar,
  variant = 'default',
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
                href="/profile"
                className="text-sm font-medium text-ink-secondary transition-colors hover:text-ink"
              >
                {profileLabel}
              </Link>
            </div>
          </div>
        </header>
      ) : null}

      {isRail ? (
        <div className="flex flex-col gap-8 md:flex-row md:gap-8 md:py-0">
          <div className="page-container flex items-center md:hidden">
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
          </div>
          <aside className="hidden w-60 shrink-0 self-stretch md:block">
            <div
              className={cn(
                'sticky flex flex-col rounded-tr-[2.5rem] bg-brand-secondary p-4 shadow-md',
                SITE_HEADER_RAIL_TOP_GAP_CLASS,
                SITE_HEADER_OFFSET_CLASS,
                SITE_HEADER_RAIL_HEIGHT_CLASS,
              )}
            >
              {sidebar}
            </div>
          </aside>
          <main className="page-container min-w-0 flex-1 py-6 md:py-8">{children}</main>
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
