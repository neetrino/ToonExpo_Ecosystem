'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { useMeQuery } from '@/features/auth/hooks/use-auth';
import { BuyerQrSheet } from '@/features/buyer/components/buyer-qr-sheet';
import { BuilderScannerSheet } from '@/features/builder/components/builder-scanner-sheet';
import {
  BUILDER_NAV_ITEMS,
  buildPublicNavItems,
  resolveBuyerProfileActive,
  type BottomNavId,
  type BottomNavItem,
} from '@/features/catalog/components/mobile-bottom-nav.items';
import { Link, usePathname } from '@/i18n/navigation';
import { isAdminPortalPath, isBuilderPortalPath } from '@/shared/ui/account-mobile-nav-controller';
import { cn } from '@/shared/ui/cn';
import { getOverlayPortalHost } from '@/shared/ui/overlay-portal-host';

/** Figma bar fill — no matching design token yet. */
const BAR_SURFACE_CLASS = 'bg-[#171717]';
const BUTTON_SIZE_CLASS = 'size-12';
const ITEM_GAP_CLASS = 'gap-2';
const BAR_PAD_CLASS = 'p-2';
const THUMB_INSET_CLASS = 'top-2 left-2';
/** Slightly slower than base switchers so the thumb glide reads clearly. */
const THUMB_SLIDE_DURATION_MS = 420;

/**
 * Sliding thumb offsets — same pattern as ViewModeToggle / AnalyticsDateRangeFilter.
 * Step = thumb width (100%) + gap-2 (0.5rem).
 */
const THUMB_TRANSLATE_BY_INDEX = [
  'translate-x-0',
  'translate-x-[calc(100%+0.5rem)]',
  'translate-x-[calc(200%+1rem)]',
  'translate-x-[calc(300%+1.5rem)]',
  'translate-x-[calc(400%+2rem)]',
] as const;

const NAV_BUTTON_CLASS = cn(
  'relative z-10 inline-flex shrink-0 items-center justify-center rounded-full',
  'transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-premium)]',
  'motion-reduce:transition-none',
  BUTTON_SIZE_CLASS,
);

type NavItemIconProps = {
  item: BottomNavItem;
};

const NavItemIcon = ({ item }: NavItemIconProps) => {
  const Icon = item.Icon;
  return <Icon className="size-6" strokeWidth={1.75} aria-hidden />;
};

/**
 * Mobile-only floating bottom navigation (Figma node 134:119).
 * Portaled at `--z-bottom-nav` so it stays above sheets, modals, and overlays.
 */
export const MobileBottomNav = () => {
  const t = useTranslations('Nav');
  const pathname = usePathname();
  const { data: me } = useMeQuery();
  const [pendingId, setPendingId] = useState<BottomNavId | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const isBuilder = me?.companyType === 'builder';
  const isAdmin = me?.accountType === 'platform_admin';
  const profileHref = isBuilder
    ? '/builder'
    : isAdmin
      ? '/admin'
      : me
        ? '/dashboard'
        : '/auth/login';
  const isProfileActive = isBuilder
    ? isBuilderPortalPath(pathname)
    : isAdmin
      ? isAdminPortalPath(pathname)
      : resolveBuyerProfileActive(pathname);

  const items = isBuilder ? BUILDER_NAV_ITEMS : buildPublicNavItems(profileHref, isProfileActive);

  const routeActiveIndex = items.findIndex((item) => item.match(pathname));
  const pendingIndex = pendingId ? items.findIndex((item) => item.id === pendingId) : -1;
  const sheetIndex = items.findIndex((item) => item.opensSheet);
  const activeIndex = sheetOpen ? sheetIndex : pendingIndex >= 0 ? pendingIndex : routeActiveIndex;
  const hasActive = activeIndex >= 0;

  useEffect(() => {
    setHost(getOverlayPortalHost());
  }, []);

  useEffect(() => {
    setPendingId(null);
    setSheetOpen(false);
  }, [pathname]);

  const closeSheet = (): void => {
    setSheetOpen(false);
    setPendingId(null);
  };

  const nav = (
    <nav
      aria-label={t('bottomNav')}
      className={cn(
        'pointer-events-none fixed inset-x-0 bottom-0 z-[var(--z-bottom-nav)] lg:hidden',
        'flex justify-center',
        'pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] pt-2',
      )}
    >
      <div
        className={cn(
          'pointer-events-auto relative flex w-fit max-w-[calc(100%-1.5rem)] items-center',
          ITEM_GAP_CLASS,
          BAR_PAD_CLASS,
          'rounded-full',
          BAR_SURFACE_CLASS,
        )}
      >
        {hasActive ? (
          <span
            aria-hidden
            className={cn(
              'pointer-events-none absolute rounded-full bg-brand-secondary',
              THUMB_INSET_CLASS,
              BUTTON_SIZE_CLASS,
              'transition-transform duration-[var(--bottom-nav-thumb-ms)] ease-[var(--ease-out-premium)]',
              'motion-reduce:transition-none',
              THUMB_TRANSLATE_BY_INDEX[activeIndex],
            )}
            style={{
              ['--bottom-nav-thumb-ms' as string]: `${THUMB_SLIDE_DURATION_MS}ms`,
            }}
          />
        ) : null}

        {items.map((item, index) => {
          const isActive = index === activeIndex;
          const label = t(item.labelKey);
          const activeClass = isActive ? 'text-white' : 'bg-white text-brand-secondary';

          if (item.opensSheet) {
            return (
              <button
                key={item.id}
                type="button"
                aria-label={label}
                aria-expanded={sheetOpen}
                onClick={() => {
                  setPendingId(item.id);
                  setSheetOpen((open) => !open);
                }}
                className={cn(NAV_BUTTON_CLASS, activeClass)}
              >
                <NavItemIcon item={item} />
              </button>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => {
                setSheetOpen(false);
                setPendingId(item.id);
              }}
              className={cn(NAV_BUTTON_CLASS, activeClass)}
            >
              <NavItemIcon item={item} />
            </Link>
          );
        })}
      </div>
    </nav>
  );

  return (
    <>
      {host ? createPortal(nav, host) : null}
      {isBuilder ? (
        <BuilderScannerSheet open={sheetOpen} onClose={closeSheet} />
      ) : (
        <BuyerQrSheet open={sheetOpen} onClose={closeSheet} />
      )}
    </>
  );
};

/** Spacer so page content clears the fixed mobile bottom nav. */
export const MobileBottomNavSpacer = () => (
  <div
    className="h-[calc(5.5rem+env(safe-area-inset-bottom,0px))] bg-canvas lg:hidden"
    aria-hidden
  />
);
