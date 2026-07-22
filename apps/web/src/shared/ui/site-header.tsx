'use client';

import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { useLogoutMutation, useMeQuery } from '@/features/auth/hooks/use-auth';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { BrandLogo } from '@/shared/ui/brand-logo';
import { cn } from '@/shared/ui/cn';
import { IconButton } from '@/shared/ui/icon-button';
import { LocaleSwitcher } from '@/shared/ui/locale-switcher';
import { ProfileMenu } from '@/shared/ui/profile-menu';
import { SiteHeaderMobileNav } from '@/shared/ui/site-header-mobile-nav';

type SiteHeaderProps = {
  className?: string | undefined;
  /** Transparent at top of home; white pill appears after scroll (ma-marie pattern). */
  variant?: 'solid' | 'transparent' | undefined;
};

const NAV_HREFS = [
  { href: '/projects' as const, key: 'buy' as const },
  { href: '/developments' as const, key: 'newDevelopments' as const },
  { href: '/partners' as const, key: 'marketInsights' as const },
  { href: '/mortgage' as const, key: 'mortgage' as const },
];

/** ma-marie `HEADER_HOME_SCROLL_THRESHOLD_PX`. */
const SCROLL_PILL_THRESHOLD_PX = 12;
/** ma-marie `HEADER_PILL_APPEAR_DURATION_MS`. */
const PILL_APPEAR_MS = 500;
/** Inward nudge of logo / actions once the pill is visible. */
const PILL_CONTENT_INSET_PX = 22;
/** How far the pill pulls in from page-container edges. */
const PILL_EDGE_INSET_CLASS = 'left-4 right-4 sm:left-5 sm:right-5 lg:left-6 lg:right-6';
/** Float gap above the pill — keeps pill height = navbar (h-16). */
const PILL_TOP_OFFSET_CLASS = 'top-2';
const HEADER_HEIGHT_CLASS = 'h-16';
/** Spacer under fixed pill chrome (top inset + bar). */
const HEADER_SPACER_CLASS = 'h-[4.5rem]';

/**
 * Public header — ma-marie style: full-bleed over home hero, frosted pill
 * on scroll (home) or always (other public pages).
 */
export const SiteHeader = ({ className, variant = 'solid' }: SiteHeaderProps) => {
  const t = useTranslations('Nav');
  const pathname = usePathname();
  const router = useRouter();
  const { data: user, isLoading, isFetching } = useMeQuery();
  const logoutMutation = useLogoutMutation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPill, setShowPill] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const isTransparentStart = variant === 'transparent';
  /** Solid pages always use the home pill chrome; home reveals it on scroll. */
  const pillVisible = !isTransparentStart || showPill || menuOpen;
  const isOverHero = isTransparentStart && !pillVisible;
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
      setShowPill(false);
      return;
    }

    const update = (): void => {
      setShowPill(window.scrollY > SCROLL_PILL_THRESHOLD_PX);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
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
  const contentInsetStyle = {
    transform: pillVisible ? `translateX(${PILL_CONTENT_INSET_PX}px)` : 'translateX(0)',
    transitionDuration: `${PILL_APPEAR_MS}ms`,
  };
  const actionsInsetStyle = {
    transform: pillVisible ? `translateX(-${PILL_CONTENT_INSET_PX}px)` : 'translateX(0)',
    transitionDuration: `${PILL_APPEAR_MS}ms`,
  };

  const handleMobileLogout = (): void => {
    void logoutMutation.mutateAsync().then(() => {
      setMenuOpen(false);
      router.push('/auth/login');
    });
  };

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-[var(--z-header)]',
          isOverHero ? 'text-on-dark' : 'text-ink',
          className,
        )}
      >
        <div
          className={cn(
            'page-container relative transition-[padding] ease-out',
            pillVisible && 'pt-2',
          )}
          style={{ transitionDuration: `${PILL_APPEAR_MS}ms` }}
        >
          <div
            aria-hidden
            className={cn(
              'pointer-events-none absolute h-16 rounded-full bg-surface-elevated',
              PILL_TOP_OFFSET_CLASS,
              PILL_EDGE_INSET_CLASS,
              'shadow-[0_4px_24px_rgb(9_43_68/0.1)]',
              'transition-opacity ease-out',
            )}
            style={{
              opacity: pillVisible ? 1 : 0,
              transitionDuration: `${PILL_APPEAR_MS}ms`,
            }}
          />

          <div
            className={cn(
              'relative z-10 flex items-center justify-between gap-4 sm:gap-6',
              HEADER_HEIGHT_CLASS,
            )}
          >
            <div
              className="flex min-w-0 items-center gap-8 transition-transform ease-out lg:gap-10"
              style={contentInsetStyle}
            >
              <BrandLogo inverted={isOverHero} onHomeClick={() => setMenuOpen(false)} />

              <nav
                className={cn(
                  'hidden items-center gap-6 lg:flex xl:gap-7',
                  'transition-colors ease-out',
                  isOverHero ? 'text-on-dark/80' : 'text-header-muted',
                )}
                style={{ transitionDuration: `${PILL_APPEAR_MS}ms` }}
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
                        'transition-colors ease-out',
                        active
                          ? isOverHero
                            ? 'text-on-dark'
                            : 'text-brand-deep'
                          : isOverHero
                            ? 'hover:text-on-dark'
                            : 'hover:text-brand-deep',
                      )}
                      style={{ transitionDuration: `${PILL_APPEAR_MS}ms` }}
                    >
                      {t(item.key)}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div
              className="flex shrink-0 items-center gap-2.5 transition-transform ease-out sm:gap-3"
              style={actionsInsetStyle}
            >
              <LocaleSwitcher tone={isOverHero ? 'dark' : 'light'} />

              <Link
                href={listPropertyHref}
                className={cn(
                  'hidden h-9 items-center rounded-full px-4 text-sm font-semibold leading-5',
                  'transition-[background-color,color] ease-out',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-deep/30 sm:inline-flex',
                  isOverHero
                    ? 'bg-on-dark text-ink hover:bg-on-dark/90'
                    : 'bg-brand-deep text-on-dark hover:bg-brand-deep/90',
                )}
                style={{ transitionDuration: `${PILL_APPEAR_MS}ms` }}
              >
                {t('listProperty')}
              </Link>

              {showAuthLoading ? (
                <span className="size-10 animate-pulse rounded-full bg-current/10" aria-hidden />
              ) : (
                <ProfileMenu
                  userName={user?.name}
                  userEmail={user?.email}
                  accountType={user?.accountType}
                  tone={isOverHero ? 'dark' : 'light'}
                />
              )}

              <IconButton
                label={t('menu')}
                className={cn(
                  'lg:hidden transition-[background-color,border-color,color] ease-out',
                  isOverHero && 'border-white/30 bg-white/10 text-on-dark hover:bg-white/15',
                )}
                style={{ transitionDuration: `${PILL_APPEAR_MS}ms` }}
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
            <SiteHeaderMobileNav
              navItems={NAV_HREFS}
              pathname={pathname}
              user={user ?? undefined}
              settingsHref={settingsHref}
              listPropertyHref={listPropertyHref}
              logoutPending={logoutMutation.isPending}
              onClose={() => setMenuOpen(false)}
              onLogout={handleMobileLogout}
              isNavActive={isNavActive}
            />
          ) : null}
        </div>
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
