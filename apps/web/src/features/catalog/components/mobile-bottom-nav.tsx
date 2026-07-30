'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { useMeQuery } from '@/features/auth/hooks/use-auth';
import { BuyerQrSheet } from '@/features/buyer/components/buyer-qr-sheet';
import { BuilderScannerSheet } from '@/features/builder/components/builder-scanner-sheet';
import {
  BUILDER_NAV_ITEMS,
  buildAdminNavItems,
  buildPublicNavItems,
  resolveBuyerProfileActive,
  type BottomNavId,
  type BottomNavItem,
} from '@/features/catalog/components/mobile-bottom-nav.items';
import { Link, usePathname } from '@/i18n/navigation';
import { isAdminPortalPath, isBuilderPortalPath } from '@/shared/ui/account-mobile-nav-controller';
import { cn } from '@/shared/ui/cn';
import { getOverlayPortalHost } from '@/shared/ui/overlay-portal-host';

/** Figma 134:119 bar fill — no matching design token yet. */
const BAR_SURFACE_CLASS = 'bg-[#171717]';
/** Figma button diameter — 56px. */
const BUTTON_SIZE_CLASS = 'size-14';
/** Figma Buttons gap — 16px. */
const ITEM_GAP_CLASS = 'gap-4';
/** Figma bar vertical padding (safe-area replaces bottom when larger). */
const BAR_PAD_CLASS = 'pt-[13px] pb-[max(7px,env(safe-area-inset-bottom,0px))]';
/**
 * Natural width of Figma slots: n×56 + (n−1)×16.
 * Used to scale the cluster on ultra-narrow cover screens.
 */
const navClusterNaturalWidthPx = (slotCount: number): number =>
  slotCount * 56 + Math.max(0, slotCount - 1) * 16;
/** Soft glide between selected tabs. */
const THUMB_SLIDE_DURATION_MS = 720;
/** Icon color / scale follows the thumb. */
const NAV_ICON_TRANSITION_MS = 720;
/** Smooth decelerating ease — no overshoot. */
const THUMB_EASE = 'cubic-bezier(0.33, 1, 0.32, 1)';

/**
 * Sliding thumb offsets — step = thumb width (100%) + gap-4 (1rem).
 */
const THUMB_TRANSLATE_BY_INDEX = [
  'translate-x-0',
  'translate-x-[calc(100%+1rem)]',
  'translate-x-[calc(200%+2rem)]',
  'translate-x-[calc(300%+3rem)]',
  'translate-x-[calc(400%+4rem)]',
] as const;

const NAV_HIT_CLASS = cn(
  'relative inline-flex shrink-0 items-center justify-center rounded-full',
  BUTTON_SIZE_CLASS,
);

type NavItemIconProps = {
  item: BottomNavItem;
  active: boolean;
};

const NavItemIcon = ({ item, active }: NavItemIconProps) => {
  const Icon = item.Icon;
  return (
    <Icon
      className={cn(
        // Slightly larger glyph on cover/narrow so icons fill the pad.
        'size-7 max-[22.5rem]:size-8',
        'transition-[color,transform] duration-[var(--bottom-nav-icon-ms)] ease-[var(--bottom-nav-ease)]',
        'motion-reduce:transition-none motion-reduce:delay-0',
        active ? 'scale-105 text-white' : 'scale-100 text-brand-secondary',
      )}
      strokeWidth={active ? 2 : 1.75}
      aria-hidden
    />
  );
};

/**
 * Mobile-only bottom navigation (Figma node 134:119).
 * Full-bleed dark bar; white pads stay put, teal thumb glides between them.
 * Ultra-narrow screens scale the whole cluster so thumb + icons stay aligned.
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

  const items = isBuilder
    ? BUILDER_NAV_ITEMS
    : isAdmin
      ? buildAdminNavItems(isProfileActive)
      : buildPublicNavItems(profileHref, isProfileActive);

  const routeActiveIndex = items.findIndex((item) => item.match(pathname));
  const pendingIndex = pendingId ? items.findIndex((item) => item.id === pendingId) : -1;
  const sheetIndex = items.findIndex((item) => item.opensSheet);
  const activeIndex =
    sheetOpen && sheetIndex >= 0 ? sheetIndex : pendingIndex >= 0 ? pendingIndex : routeActiveIndex;
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
  };

  const openSheet = (): void => {
    setSheetOpen(true);
  };

  const navVars = {
    ['--bottom-nav-icon-ms' as string]: `${NAV_ICON_TRANSITION_MS}ms`,
    ['--bottom-nav-thumb-ms' as string]: `${THUMB_SLIDE_DURATION_MS}ms`,
    ['--bottom-nav-ease' as string]: THUMB_EASE,
    ['--bottom-nav-natural-width' as string]: `${navClusterNaturalWidthPx(items.length)}px`,
  };

  const nav = (
    <nav
      aria-label={t('bottomNav')}
      className={cn(
        'pointer-events-none fixed inset-x-0 bottom-0 z-[var(--z-bottom-nav)] lg:hidden',
      )}
    >
      <div
        className={cn(
          'pointer-events-auto flex w-full justify-center',
          BAR_PAD_CLASS,
          'rounded-t-[40px]',
          BAR_SURFACE_CLASS,
        )}
        style={navVars}
      >
        <div
          className={cn(
            'relative flex origin-bottom items-center',
            ITEM_GAP_CLASS,
            // Scale the whole row on cover screens so thumb stays locked to every slot.
            'max-[22.5rem]:scale-[min(1,calc((100vw-0.75rem)/var(--bottom-nav-natural-width)))]',
          )}
        >
          {/* Static white pads — never mount/unmount with selection (no pop). */}
          {items.map((item) => (
            <span
              key={`pad-${item.id}`}
              aria-hidden
              className={cn('shrink-0 rounded-full bg-white', BUTTON_SIZE_CLASS)}
            />
          ))}

          {hasActive ? (
            <span
              aria-hidden
              className={cn(
                'pointer-events-none absolute top-0 left-0 z-[1] rounded-full bg-brand-secondary',
                BUTTON_SIZE_CLASS,
                'transition-transform duration-[var(--bottom-nav-thumb-ms)] ease-[var(--bottom-nav-ease)]',
                'will-change-transform motion-reduce:transition-none',
                THUMB_TRANSLATE_BY_INDEX[activeIndex],
              )}
            />
          ) : null}

          <div className={cn('absolute inset-0 z-[2] flex items-center', ITEM_GAP_CLASS)}>
            {items.map((item, index) => {
              const isActive = index === activeIndex;
              const label = t(item.labelKey);

              if (item.opensSheet) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={label}
                    aria-expanded={sheetOpen}
                    onClick={() => {
                      if (sheetOpen) {
                        closeSheet();
                        return;
                      }
                      openSheet();
                    }}
                    className={NAV_HIT_CLASS}
                  >
                    <NavItemIcon item={item} active={isActive} />
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
                  className={NAV_HIT_CLASS}
                >
                  <NavItemIcon item={item} active={isActive} />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );

  return (
    <>
      {isBuilder ? (
        <BuilderScannerSheet open={sheetOpen} onClose={closeSheet} />
      ) : isAdmin ? null : (
        <BuyerQrSheet open={sheetOpen} onClose={closeSheet} />
      )}
      {/* Portal nav after sheets so DOM order matches z-index (nav above sheets). */}
      {host ? createPortal(nav, host) : null}
    </>
  );
};

/**
 * Spacer so page content clears the fixed mobile bottom nav.
 * Matches Figma 134:119: 13px + 56px + max(7px, safe-area).
 */
export const MobileBottomNavSpacer = () => (
  <div
    className="h-[calc(4.3125rem+max(0.4375rem,env(safe-area-inset-bottom,0px)))] bg-canvas lg:hidden"
    aria-hidden
  />
);
