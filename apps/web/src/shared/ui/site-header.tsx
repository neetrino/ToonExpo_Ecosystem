'use client';

import { Menu, X } from 'lucide-react';
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
  { href: '/projects' as const, key: 'buy' as const },
  { href: '/builders' as const, key: 'newDevelopments' as const },
  { href: '/partners' as const, key: 'marketInsights' as const },
  { href: '/mortgage' as const, key: 'mortgage' as const },
];

const SCROLL_SOLID_OFFSET_PX = 24;
const HEADER_HEIGHT_CLASS = 'h-16';
const HEADER_SPACER_CLASS = 'h-16';

/**
 * Fixed public header — full-bleed frosted bar matching the Figma Header.
 * Transparent over the home hero, then solid after scroll / on other pages.
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

  const settingsHref = user?.accountType === 'platform_admin' ? '/admin/settings' : '/settings';
  const listPropertyHref =
    user?.accountType === 'company_member' && user.companyType === 'builder'
      ? ('/builder' as const)
      : ('/auth/register' as const);
  const signInHref = user ? settingsHref : '/auth/login';

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-[var(--z-header)] border-b',
          'transition-[background-color,border-color,color,backdrop-filter] duration-[var(--duration-base)] ease-[var(--ease-out-premium)]',
          isOverHero
            ? 'border-transparent bg-transparent text-on-dark backdrop-blur-0'
            : 'border-header-border bg-header-bg text-ink backdrop-blur-[6px]',
          className,
        )}
      >
        <div
          className={cn(
            'page-container flex items-center justify-between gap-6',
            HEADER_HEIGHT_CLASS,
          )}
        >
          <div className="flex min-w-0 items-center gap-10">
            <BrandLogo inverted={isOverHero} />

            <nav
              className={cn(
                'hidden items-center gap-7 lg:flex',
                isOverHero ? 'text-on-dark/80' : 'text-header-muted',
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
                      'whitespace-nowrap text-sm font-medium leading-5',
                      'transition-colors duration-[var(--duration-fast)]',
                      active
                        ? isOverHero
                          ? 'text-on-dark'
                          : 'text-brand-deep'
                        : isOverHero
                          ? 'hover:text-on-dark'
                          : 'hover:text-brand-deep',
                    )}
                  >
                    {t(item.key)}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <LocaleSwitcher tone={isOverHero ? 'dark' : 'light'} />

            {showAuthLoading ? (
              <span
                className="hidden h-5 w-14 animate-pulse rounded-sm bg-current/10 sm:inline-block"
                aria-hidden
              />
            ) : user ? (
              <div className="hidden items-center gap-3 sm:flex">
                <Link
                  href={settingsHref}
                  className={cn(
                    'max-w-36 truncate text-sm font-medium leading-5',
                    'transition-colors duration-[var(--duration-fast)]',
                    isOverHero
                      ? 'text-on-dark/80 hover:text-on-dark'
                      : 'text-header-muted hover:text-brand-deep',
                  )}
                >
                  {user.name}
                </Link>
                <LogoutButton
                  className={cn(isOverHero && 'border-transparent text-on-dark hover:bg-white/10')}
                />
              </div>
            ) : (
              <Link
                href={signInHref}
                className={cn(
                  'hidden text-sm font-medium leading-5 sm:inline',
                  'transition-colors duration-[var(--duration-fast)]',
                  isOverHero
                    ? 'text-on-dark/80 hover:text-on-dark'
                    : 'text-header-muted hover:text-brand-deep',
                )}
              >
                {t('login')}
              </Link>
            )}

            <Link
              href={listPropertyHref}
              className={cn(
                'hidden h-9 items-center rounded-sm bg-brand-deep px-4 text-sm font-semibold leading-5 text-on-dark',
                'transition-colors duration-[var(--duration-fast)] hover:bg-brand-deep/90',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-deep/30 sm:inline-flex',
                isOverHero && 'bg-on-dark text-ink hover:bg-on-dark/90',
              )}
            >
              {t('listProperty')}
            </Link>

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
            className="border-t border-header-border bg-header-bg px-4 py-4 text-ink shadow-md backdrop-blur-[6px] sm:px-6 lg:hidden"
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
                      active ? 'bg-brand-soft text-brand-deep' : 'text-ink hover:bg-surface',
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
                    className="rounded-sm px-3 py-3 font-medium text-brand-deep hover:bg-brand-soft"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t('listProperty')}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href={settingsHref}
                    className="rounded-sm px-3 py-3 font-medium text-ink hover:bg-surface"
                    onClick={() => setMenuOpen(false)}
                  >
                    {user.name}
                  </Link>
                  <Link
                    href={listPropertyHref}
                    className="rounded-sm px-3 py-3 font-medium text-brand-deep hover:bg-brand-soft"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t('listProperty')}
                  </Link>
                </>
              )}
            </nav>
          </div>
        ) : null}
      </header>

      {needsSpacer ? <div className={HEADER_SPACER_CLASS} aria-hidden /> : null}
    </>
  );
};

const isNavActive = (pathname: string, href: (typeof NAV_HREFS)[number]['href']): boolean => {
  if (href === '/projects') {
    return pathname.startsWith('/projects') || pathname.startsWith('/apartments');
  }
  return pathname.startsWith(href);
};
