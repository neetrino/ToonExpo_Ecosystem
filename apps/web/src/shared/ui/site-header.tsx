'use client';

import { Menu, UserRound, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { LogoutButton } from '@/features/auth/components/logout-button';
import { useMeQuery } from '@/features/auth/hooks/use-auth';
import { Link, usePathname } from '@/i18n/navigation';
import { BrandLogo } from '@/shared/ui/brand-logo';
import { IconButton } from '@/shared/ui/icon-button';
import { LocaleSwitcher } from '@/shared/ui/locale-switcher';
import { cn } from '@/shared/ui/cn';

type SiteHeaderProps = {
  className?: string | undefined;
  /** Transparent over hero imagery; becomes solid after scroll. */
  variant?: 'solid' | 'transparent' | undefined;
};

const NAV_HREFS = [
  { href: '/projects' as const, key: 'projects' as const },
  { href: '/builders' as const, key: 'builders' as const },
  { href: '/partners' as const, key: 'partners' as const },
  { href: '/mortgage' as const, key: 'mortgage' as const },
  { href: '/expo' as const, key: 'expoMap' as const },
];

const SCROLL_SOLID_OFFSET_PX = 24;
const HEADER_BAR_CLASS =
  'page-container grid grid-cols-[minmax(0,auto)_minmax(0,1fr)] items-center gap-3 py-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-6 lg:py-3.5';

/**
 * Fixed public header — always visible while scrolling on every page.
 * Transparent hero variant is full-bleed over imagery, then matches the solid
 * floating rounded chrome used on every other page.
 */
export const SiteHeader = ({ className, variant = 'solid' }: SiteHeaderProps) => {
  const t = useTranslations('Nav');
  const pathname = usePathname();
  const { data: user, isLoading, isFetching } = useMeQuery();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  /** Avoid auth SSR/client mismatch until the session hint is readable. */
  const [authReady, setAuthReady] = useState(false);
  const isTransparentStart = variant === 'transparent';
  const isOverHero = isTransparentStart && !scrolled && !menuOpen;
  /** Solid chrome is always the same floating rounded bar on every page. */
  const isFloating = !isOverHero;
  const needsSpacer = !isTransparentStart;
  const showAuthLoading = !authReady || isLoading || (isFetching && !user);

  useEffect(() => {
    setAuthReady(true);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isTransparentStart) {
      setScrolled(false);
      return;
    }

    const updateScrolled = (): void => {
      setScrolled(window.scrollY > SCROLL_SOLID_OFFSET_PX);
    };

    updateScrolled();
    window.addEventListener('scroll', updateScrolled, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateScrolled);
    };
  }, [isTransparentStart]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  const settingsHref = user?.accountType === 'platform_admin' ? '/admin/settings' : '/dashboard';
  const profileHref = user ? settingsHref : '/auth/login';
  const profileIconClassName = cn(
    'inline-flex size-9 items-center justify-center rounded-sm border',
    'transition-colors duration-[var(--duration-fast)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30',
    isOverHero
      ? 'border-white/30 bg-white/10 text-on-dark hover:bg-white/15'
      : 'border-border bg-surface-elevated text-ink hover:border-border-strong hover:bg-surface',
  );

  return (
    <>
      <header
        className={cn(
          'fixed z-[var(--z-header)]',
          'transition-[top,left,right,border-radius,background-color,border-color,box-shadow,color,backdrop-filter] duration-[var(--duration-base)] ease-[var(--ease-out-premium)]',
          isFloating
            ? 'top-3 inset-x-3 overflow-hidden rounded-md border border-border/70 bg-surface-elevated/92 text-ink shadow-sm backdrop-blur-xl sm:inset-x-5 lg:inset-x-6'
            : 'inset-x-0 top-0 w-full rounded-none border-b border-transparent bg-transparent text-on-dark',
          className,
        )}
      >
        <div className={HEADER_BAR_CLASS}>
          <div className="justify-self-start">
            <BrandLogo inverted={isOverHero} />
          </div>

          <nav
            className={cn(
              'hidden items-center justify-center gap-1 lg:flex',
              isOverHero ? 'text-on-dark/80' : 'text-ink-secondary',
            )}
            aria-label={t('main')}
          >
            {NAV_HREFS.map((item) => {
              const active = isNavActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative whitespace-nowrap rounded-sm px-3 py-2 text-[13px] font-medium tracking-[-0.01em]',
                    'transition-[color,background-color] duration-[var(--duration-fast)]',
                    active
                      ? isOverHero
                        ? 'bg-white/12 text-on-dark'
                        : 'bg-brand-soft text-brand'
                      : isOverHero
                        ? 'hover:bg-white/10 hover:text-on-dark'
                        : 'hover:bg-surface hover:text-ink',
                  )}
                >
                  {t(item.key)}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center justify-end gap-2 justify-self-end sm:gap-2.5">
            <LocaleSwitcher tone={isOverHero ? 'dark' : 'light'} />
            {showAuthLoading ? (
              <span className="size-9 animate-pulse rounded-sm bg-current/10" aria-hidden />
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href={profileHref}
                  aria-label={t('profile')}
                  title={t('profile')}
                  className={profileIconClassName}
                >
                  <UserRound className="size-4" aria-hidden />
                </Link>
                {user ? (
                  <LogoutButton
                    className={cn(
                      'hidden sm:inline-flex',
                      isOverHero && 'border-transparent text-on-dark hover:bg-white/10',
                    )}
                  />
                ) : null}
              </div>
            )}

            <IconButton
              label={t('menu')}
              className={cn(
                'lg:hidden',
                isOverHero && 'border-white/30 bg-white/10 text-on-dark hover:bg-white/15',
              )}
              variant="outline"
              size="sm"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? (
                <X className="size-4" aria-hidden />
              ) : (
                <Menu className="size-4" aria-hidden />
              )}
            </IconButton>
          </div>
        </div>

        {menuOpen ? (
          <div
            id="mobile-nav"
            className="border-t border-border/50 bg-surface-elevated px-4 py-4 text-ink shadow-md sm:px-6 lg:hidden"
          >
            <nav className="flex flex-col gap-1 text-sm" aria-label={t('main')}>
              {NAV_HREFS.map((item) => {
                const active = isNavActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'rounded-sm px-3 py-3 font-medium transition-colors',
                      active ? 'bg-brand-soft text-brand' : 'text-ink hover:bg-surface',
                    )}
                    onClick={() => setMenuOpen(false)}
                  >
                    {t(item.key)}
                  </Link>
                );
              })}
              {!user ? (
                <>
                  <Link
                    href="/auth/login"
                    className="rounded-sm px-3 py-3 font-medium text-ink hover:bg-surface"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t('login')}
                  </Link>
                  <Link
                    href="/auth/register"
                    className="rounded-sm px-3 py-3 font-medium text-brand hover:bg-brand-soft"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t('register')}
                  </Link>
                </>
              ) : (
                <Link
                  href={settingsHref}
                  className="rounded-sm px-3 py-3 font-medium text-ink hover:bg-surface"
                  onClick={() => setMenuOpen(false)}
                >
                  {user.name}
                </Link>
              )}
            </nav>
          </div>
        ) : null}
      </header>

      {needsSpacer ? (
        <div className="h-[calc(0.75rem+3.75rem)] sm:h-[calc(0.75rem+4rem)]" aria-hidden />
      ) : null}
    </>
  );
};

const isNavActive = (pathname: string, href: (typeof NAV_HREFS)[number]['href']): boolean => {
  if (href === '/projects') {
    return pathname.startsWith('/projects');
  }
  return pathname.startsWith(href);
};
