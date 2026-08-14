'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { useMeQuery } from '@/features/auth/hooks/use-auth';
import { Link, usePathname } from '@/i18n/navigation';
import { isPartnerCompatibleCompany } from '@/features/partners/utils/is-partner-compatible-company';
import {
  accountMobileNavController,
  isNavbarControlledPortalPath,
} from '@/shared/ui/account-mobile-nav-controller';
import { BrandLogo } from '@/shared/ui/brand-logo';
import { BurgerMenuIcon } from '@/shared/ui/burger-menu-icon';
import { lockBodyScrollSoft, unlockBodyScrollSoft } from '@/shared/ui/body-scroll-lock';
import { cn } from '@/shared/ui/cn';
import { IconButton } from '@/shared/ui/icon-button';
import { LocaleSwitcher } from '@/shared/ui/locale-switcher';
import { ProfileMenu } from '@/shared/ui/profile-menu';
import {
  BURGER_BACKDROP_MS,
  BURGER_MENU_MS,
  HEADER_HEIGHT_CLASS,
  HEADER_SPACER_CLASS,
  isSiteHeaderNavActive,
  PILL_APPEAR_MS,
  PILL_TOP_OFFSET_CLASS,
  resolveHeaderPillLayout,
  SCROLL_PILL_THRESHOLD_PX,
  SITE_HEADER_NAV_HREFS,
} from '@/shared/ui/site-header.constants';
import { SiteHeaderMobileNav } from '@/shared/ui/site-header-mobile-nav';
import { useDrawerTransition } from '@/shared/ui/use-drawer-transition';

type SiteHeaderProps = {
  className?: string | undefined;
  /** Transparent at top of home; white pill appears after scroll (ma-marie pattern). */
  variant?: 'solid' | 'transparent' | undefined;
};

/**
 * Public header — ma-marie style pill on scroll; burger motion is decoupled from pill chrome.
 */
export const SiteHeader = ({ className, variant = 'solid' }: SiteHeaderProps) => {
  const t = useTranslations('Nav');
  const tCommon = useTranslations('Common');
  const { edgeInsetClass, contentInsetPx } = resolveHeaderPillLayout(useLocale());
  const pathname = usePathname();
  const { data: user } = useMeQuery();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountNavOpen, setAccountNavOpen] = useState(false);
  const [showPill, setShowPill] = useState(false);
  const isTransparentStart = variant === 'transparent';
  const isAccountRoute = isNavbarControlledPortalPath(pathname);
  /** Light map tiles — keep pill chrome readable while map stays full-bleed. */
  const isGeoMapRoute = pathname === '/map' || pathname.startsWith('/map/');
  const burgerOpen = isAccountRoute ? accountNavOpen : menuOpen;
  const publicMenuOpen = menuOpen && !isAccountRoute;
  const { rendered: menuRendered, visible: menuVisible } = useDrawerTransition(
    publicMenuOpen,
    BURGER_MENU_MS,
  );
  /** Pill follows scroll / solid pages only — never the burger. */
  const pillVisible = !isTransparentStart || showPill || isGeoMapRoute;
  const isOverHero = isTransparentStart && !pillVisible;
  const needsSpacer = !isTransparentStart;

  useEffect(() => {
    setMenuOpen(false);
    accountMobileNavController.setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isAccountRoute) {
      accountMobileNavController.setOpen(false);
      return;
    }
    return accountMobileNavController.subscribe(setAccountNavOpen);
  }, [isAccountRoute]);

  useEffect(() => {
    if (!isTransparentStart) {
      setShowPill(false);
      return;
    }

    const update = (): void => {
      // Hard/soft locks can report scrollY=0 — don’t collapse an already-open pill
      // while the burger menu is showing.
      if (menuOpen && !isAccountRoute) {
        return;
      }
      setShowPill(window.scrollY > SCROLL_PILL_THRESHOLD_PX);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [isTransparentStart, menuOpen, isAccountRoute]);

  useEffect(() => {
    if (!menuRendered || isAccountRoute) {
      return;
    }
    // Soft lock keeps window.scrollY stable so the pill doesn’t flicker closed.
    lockBodyScrollSoft();
    return () => {
      unlockBodyScrollSoft();
    };
  }, [menuRendered, isAccountRoute]);

  const isBuilderMember =
    user?.accountType === 'company_member' &&
    (user.companyType == null ||
      user.companyType === 'builder' ||
      !isPartnerCompatibleCompany(user.companyType));
  const contentInsetStyle = {
    transform: pillVisible ? `translateX(${contentInsetPx}px)` : 'translateX(0)',
    transitionDuration: `${PILL_APPEAR_MS}ms`,
  };
  const actionsInsetStyle = {
    transform: pillVisible ? `translateX(-${contentInsetPx}px)` : 'translateX(0)',
    transitionDuration: `${PILL_APPEAR_MS}ms`,
  };

  return (
    <>
      {menuRendered ? (
        <button
          type="button"
          aria-label={tCommon('close')}
          className={cn(
            'fixed inset-0 z-[calc(var(--z-header)-1)] cursor-default lg:hidden',
            'bg-ink/35 backdrop-blur-[2px]',
            'motion-reduce:backdrop-blur-none',
            menuVisible ? 'opacity-100' : 'opacity-0',
          )}
          style={{
            transitionProperty: 'opacity, backdrop-filter',
            transitionDuration: `${BURGER_BACKDROP_MS}ms`,
            transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
          }}
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <header
        className={cn(
          'fixed inset-x-0 top-0 z-[var(--z-header)]',
          'pt-[env(safe-area-inset-top,0px)]',
          isOverHero ? 'text-on-dark' : 'text-ink',
          isAccountRoute && 'max-md:hidden',
          className,
        )}
      >
        <div
          className={cn(
            'page-container relative transition-[padding] ease-[var(--ease-out-premium)]',
            'motion-reduce:transition-none',
            pillVisible && 'pt-2',
          )}
          style={{ transitionDuration: `${PILL_APPEAR_MS}ms` }}
        >
          <div
            aria-hidden
            className={cn(
              'pointer-events-none absolute h-16 rounded-full bg-surface-elevated',
              PILL_TOP_OFFSET_CLASS,
              edgeInsetClass,
              'shadow-[0_4px_24px_rgb(9_43_68/0.1)]',
              'transition-opacity ease-[var(--ease-out-premium)] motion-reduce:transition-none',
            )}
            style={{
              opacity: pillVisible ? 1 : 0,
              transitionDuration: `${PILL_APPEAR_MS}ms`,
            }}
          />

          <div
            className={cn('relative z-10 flex items-center gap-4 sm:gap-6', HEADER_HEIGHT_CLASS)}
          >
            <div
              className="flex shrink-0 items-center transition-transform ease-[var(--ease-out-premium)] motion-reduce:transition-none"
              style={contentInsetStyle}
            >
              <BrandLogo
                inverted={isOverHero}
                onHomeClick={() => {
                  setMenuOpen(false);
                  accountMobileNavController.setOpen(false);
                }}
              />
            </div>

            <nav
              className={cn(
                'hidden min-w-0 flex-1 items-center justify-center gap-6 lg:flex xl:gap-7',
                'transition-colors ease-[var(--ease-out-premium)]',
                isOverHero ? 'text-on-dark/80' : 'text-header-muted',
              )}
              style={{ transitionDuration: `${PILL_APPEAR_MS}ms` }}
              aria-label={t('main')}
            >
              {SITE_HEADER_NAV_HREFS.map((item) => {
                const active = isSiteHeaderNavActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'whitespace-nowrap text-sm leading-5',
                      'transition-colors ease-[var(--ease-out-premium)]',
                      active
                        ? isOverHero
                          ? 'font-bold text-on-dark'
                          : 'font-bold text-brand'
                        : cn(
                            'font-medium',
                            isOverHero ? 'hover:text-brand-logo' : 'hover:text-brand',
                          ),
                    )}
                    style={{ transitionDuration: `${PILL_APPEAR_MS}ms` }}
                  >
                    {t(item.key)}
                  </Link>
                );
              })}
            </nav>

            <div
              className="ml-auto flex shrink-0 items-center gap-2.5 transition-transform ease-[var(--ease-out-premium)] motion-reduce:transition-none sm:gap-3 lg:ml-0"
              style={actionsInsetStyle}
            >
              <div className="hidden lg:block">
                <LocaleSwitcher tone={isOverHero ? 'dark' : 'light'} />
              </div>

              <div className="hidden lg:block">
                <ProfileMenu
                  userName={user?.name}
                  userEmail={user?.email}
                  accountType={user?.accountType}
                  companyType={user?.companyType}
                  showBuilder={isBuilderMember}
                  tone={isOverHero ? 'dark' : 'light'}
                />
              </div>

              <IconButton
                label={t('menu')}
                className={cn(
                  'rounded-full transition-[background-color,border-color,color,transform]',
                  'ease-[var(--ease-out-premium)] active:scale-95',
                  isAccountRoute ? 'md:hidden' : 'lg:hidden',
                  isOverHero && 'border-white/30 bg-white/10 text-on-dark hover:bg-white/15',
                )}
                style={{
                  transitionDuration: `${PILL_APPEAR_MS}ms`,
                  ['--burger-icon-ms' as string]: `${BURGER_MENU_MS}ms`,
                }}
                variant="outline"
                size="md"
                aria-expanded={burgerOpen || menuRendered}
                aria-controls={isAccountRoute ? 'portal-mobile-nav' : 'mobile-nav'}
                onClick={() => {
                  if (isAccountRoute) {
                    accountMobileNavController.toggle();
                    return;
                  }
                  setMenuOpen((open) => !open);
                }}
              >
                {/* Follow open intent immediately — don’t wait for menu exit unmount. */}
                <BurgerMenuIcon open={burgerOpen} />
              </IconButton>
            </div>
          </div>

          {menuRendered ? (
            <div className={cn('absolute top-full z-10 mt-2 lg:hidden', edgeInsetClass)}>
              <SiteHeaderMobileNav
                navItems={SITE_HEADER_NAV_HREFS}
                pathname={pathname}
                onClose={() => setMenuOpen(false)}
                isNavActive={isSiteHeaderNavActive}
                visible={menuVisible}
                durationMs={BURGER_MENU_MS}
              />
            </div>
          ) : null}
        </div>
      </header>

      {needsSpacer ? (
        <div className={cn(HEADER_SPACER_CLASS, isAccountRoute && 'max-md:hidden')} aria-hidden />
      ) : null}
    </>
  );
};
