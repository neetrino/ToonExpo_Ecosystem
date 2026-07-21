'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { BrandLogo } from '@/shared/ui/brand-logo';
import { IconButton } from '@/shared/ui/icon-button';
import { LocaleSwitcher } from '@/shared/ui/locale-switcher';
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
};

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
}: PortalShellProps) => {
  const t = useTranslations('Nav');
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

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
      <header className="sticky top-0 z-[var(--z-header)] border-b border-border bg-surface-elevated/95 backdrop-blur-md">
        <div className="page-container flex items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-2">
            <IconButton
              label={drawerOpen ? t('menu') : t('menu')}
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

      <div className="page-container flex flex-col gap-8 py-6 md:flex-row md:py-8">
        <aside className="hidden w-56 shrink-0 md:block">
          <div className="sticky top-24 rounded-md border border-border bg-surface-elevated p-3 shadow-xs">
            {sidebar}
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>

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
              'absolute inset-y-0 left-0 flex w-[min(100%,20rem)] flex-col',
              'border-r border-border bg-surface-elevated p-4 shadow-lg',
            )}
          >
            <div className="mb-4 flex items-center justify-between">
              <BrandLogo href={brandHref} badge={badge} size="sm" />
              <IconButton label={t('menu')} size="sm" onClick={() => setDrawerOpen(false)}>
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
