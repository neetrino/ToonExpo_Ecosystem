'use client';

import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { BrandLogo } from '@/shared/ui/brand-logo';
import { accountMobileNavController } from '@/shared/ui/account-mobile-nav-controller';
import { lockBodyScroll, unlockBodyScroll } from '@/shared/ui/body-scroll-lock';
import { DrawerCloseTab } from '@/shared/ui/drawer-close-tab';
import { IconButton } from '@/shared/ui/icon-button';
import { LocaleSwitcher } from '@/shared/ui/locale-switcher';
import { MODAL_BACKDROP_CLASS_NAME } from '@/shared/ui/modal-backdrop';
import {
  SIDE_SHEET_BACKDROP_TRANSITION_MS,
  SIDE_SHEET_PANEL_TRANSITION_MS,
  SIDE_SHEET_PANEL_Z_INDEX,
  SIDE_SHEET_Z_INDEX,
} from '@/shared/ui/side-sheet.constants';
import { SiteHeader } from '@/shared/ui/site-header';
import { useDrawerTransition } from '@/shared/ui/use-drawer-transition';
import { Link, usePathname } from '@/i18n/navigation';
import { usePersistedRailCollapsed } from '@/shared/hooks/use-persisted-rail-collapsed';
import { cn } from '@/shared/ui/cn';
import { MOBILE_BOTTOM_NAV_CONTENT_PB_CLASS } from '@/shared/ui/mobile-bottom-nav-clearance';
import { PortalRailDesktopAside } from '@/shared/ui/portal-rail-desktop-aside';
import {
  PORTAL_RAIL_COLLAPSED_STORAGE_KEY,
  PORTAL_RAIL_WIDTH_COLLAPSED_CLASS,
  PORTAL_RAIL_WIDTH_EXPANDED_CLASS,
  PORTAL_RAIL_INSET_TRANSITION_CLASS,
  PORTAL_RAIL_WIDTH_TRANSITION_CLASS,
} from '@/shared/ui/portal-rail.constants';

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
   * `rail` — floating dark sidebar + public SiteHeader (admin / account / builder).
   * Default keeps the light portal card chrome.
   */
  variant?: 'default' | 'rail';
  /**
   * When false, skip SiteHeader (use when PublicChrome already mounts it —
   * buyer account routes).
   */
  showSiteHeader?: boolean | undefined;
  /**
   * Opaque bands under the floating header so scrolled content vanishes.
   * Turn off for buyer account so the pill sits like on public pages.
   */
  showRailHeaderMask?: boolean | undefined;
  /**
   * When true, the public SiteHeader burger opens this drawer (buyer account).
   * Hides the in-page mobile menu button.
   */
  mobileDrawerControlledByNavbar?: boolean | undefined;
  /** Optional label shown beside the mobile menu control (rail). */
  mobileHeader?: ReactNode;
  /** Extra classes on the shell root (e.g. `bg-canvas` for buyer account). */
  className?: string | undefined;
  /** Desktop rail collapse (variant `rail` only). Defaults to true for rail. */
  railCollapsible?: boolean | undefined;
  /** localStorage key for collapsed preference. */
  railCollapsedStorageKey?: string | undefined;
  /** Accessible labels for the rail collapse toggle. */
  railCollapseLabels?: { expand: string; collapse: string } | undefined;
};

/**
 * SiteHeader pill chrome is ~4.5rem (top inset + h-16).
 * Sidebar is pinned with top + bottom (not a fixed vh height) so the full
 * rail stays inside the visual viewport at any zoom / short screen.
 * Rail chrome runs under the bottom nav (lower z-index); inner padding keeps labels clear.
 * Content mask extends a bit lower so scrolled main vanishes under the header.
 */
const RAIL_CHROME_TOP_CLASS = 'top-[calc(5.5rem+env(safe-area-inset-top,0px))]';
const RAIL_CHROME_BOTTOM_CLASS = 'bottom-0';
/** Header spacer band under the fixed pill. */
const RAIL_HEADER_BAND_HEIGHT_CLASS = 'h-[calc(4.5rem+env(safe-area-inset-top,0px))]';
/** Header band + light extra clip so content vanishes just below the header edge. */
const RAIL_CONTENT_MASK_HEIGHT_CLASS = 'h-[calc(5.125rem+env(safe-area-inset-top,0px))]';
/** Narrower than desktop rail so the drawer leaves more page visible on phones. */
const MOBILE_DRAWER_WIDTH_CLASS = 'w-[min(72vw,14rem)]';
/** Armenian labels need a touch more room in the mobile drawer. */
const MOBILE_DRAWER_WIDTH_HY_CLASS = 'w-[min(78vw,15.5rem)]';
/** Slightly below admin sheet close tab — aligns with logo block on the dark rail. */
const MOBILE_DRAWER_CLOSE_TOP_PX = 36;
const RAIL_ROW_GAP_CLASS = 'md:pt-4';
/** Mobile-only top air when the public pill has no opaque header band. */
const RAIL_ROW_GAP_PUBLIC_HEADER_MOBILE_CLASS =
  'max-md:pt-[max(0.75rem,env(safe-area-inset-top,0px))]';

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
  showSiteHeader = true,
  showRailHeaderMask = true,
  mobileDrawerControlledByNavbar = false,
  mobileHeader,
  className,
  railCollapsible = true,
  railCollapsedStorageKey = PORTAL_RAIL_COLLAPSED_STORAGE_KEY,
  railCollapseLabels,
}: PortalShellProps) => {
  const t = useTranslations('Nav');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { rendered: drawerRendered, visible: drawerVisible } = useDrawerTransition(
    drawerOpen,
    SIDE_SHEET_PANEL_TRANSITION_MS,
  );
  const isRail = variant === 'rail';
  const railCollapseEnabled = isRail && railCollapsible;
  const { effectiveCollapsed: railCollapsed, toggleCollapsed: toggleRailCollapsed } =
    usePersistedRailCollapsed(railCollapsedStorageKey, railCollapseEnabled);
  const railCollapseCopy = useMemo(
    () => ({
      expand: railCollapseLabels?.expand ?? t('railExpand'),
      collapse: railCollapseLabels?.collapse ?? t('railCollapse'),
    }),
    [railCollapseLabels, t],
  );
  const railWidthClass = railCollapsed
    ? PORTAL_RAIL_WIDTH_COLLAPSED_CLASS
    : PORTAL_RAIL_WIDTH_EXPANDED_CLASS;
  const renderSiteHeader = isRail && showSiteHeader;
  const renderRailHeaderMask = isRail && showRailHeaderMask;
  /** Keep under-header clip the same fill as the shell (e.g. admin `bg-canvas`). */
  const railMaskFillClass = className?.split(/\s+/).includes('bg-canvas')
    ? 'bg-canvas'
    : 'bg-background';
  const mobileDrawerWidthClass =
    locale === 'hy' ? MOBILE_DRAWER_WIDTH_HY_CLASS : MOBILE_DRAWER_WIDTH_CLASS;

  useEffect(() => {
    if (mobileDrawerControlledByNavbar) {
      accountMobileNavController.setOpen(false);
      return;
    }
    setDrawerOpen(false);
  }, [pathname, mobileDrawerControlledByNavbar]);

  useEffect(() => {
    if (!mobileDrawerControlledByNavbar) {
      return;
    }
    return accountMobileNavController.subscribe(setDrawerOpen);
  }, [mobileDrawerControlledByNavbar]);

  useEffect(() => {
    if (!drawerRendered) {
      return;
    }
    lockBodyScroll();
    return () => {
      unlockBodyScroll();
    };
  }, [drawerRendered]);

  useEffect(() => {
    if (!railCollapseEnabled) {
      return;
    }
    window.dispatchEvent(new Event('resize'));
  }, [railCollapseEnabled, railCollapsed]);

  const closeDrawer = (): void => {
    if (mobileDrawerControlledByNavbar) {
      accountMobileNavController.setOpen(false);
      return;
    }
    setDrawerOpen(false);
  };

  const mobileDrawer =
    drawerRendered && typeof document !== 'undefined' ? (
      <div
        className={cn('fixed inset-0 md:hidden', drawerVisible ? '' : 'pointer-events-none')}
        style={{ zIndex: SIDE_SHEET_Z_INDEX }}
        aria-hidden={!drawerVisible}
      >
        <button
          type="button"
          tabIndex={drawerVisible ? 0 : -1}
          className={cn(
            'absolute inset-0',
            MODAL_BACKDROP_CLASS_NAME,
            'transition-opacity duration-[var(--side-sheet-backdrop-ms)] ease-[var(--ease-out-premium)]',
            'motion-reduce:transition-none',
            drawerVisible ? 'opacity-100' : 'opacity-0',
          )}
          style={{
            ['--side-sheet-backdrop-ms' as string]: `${SIDE_SHEET_BACKDROP_TRANSITION_MS}ms`,
          }}
          aria-label={tCommon('close')}
          onClick={closeDrawer}
        />
        <div
          className={cn(
            'absolute inset-y-0 left-0',
            mobileDrawerWidthClass,
            'transition-transform duration-[var(--side-sheet-panel-ms)] ease-[var(--ease-out-premium)]',
            'motion-reduce:transition-none motion-reduce:duration-0 will-change-transform',
            drawerVisible
              ? 'pointer-events-auto translate-x-0'
              : 'pointer-events-none -translate-x-full motion-reduce:translate-x-0',
          )}
          style={{
            ['--side-sheet-panel-ms' as string]: `${SIDE_SHEET_PANEL_TRANSITION_MS}ms`,
          }}
        >
          <DrawerCloseTab
            edge="end"
            onClose={closeDrawer}
            closeLabel={tCommon('close')}
            topPx={MOBILE_DRAWER_CLOSE_TOP_PX}
          />
          <nav
            id="portal-mobile-nav"
            aria-label={navLabel}
            className={cn(
              'relative flex h-full w-full flex-col overflow-hidden p-4',
              'rounded-tr-[2.5rem] rounded-br-[2.5rem] shadow-[8px_0_40px_rgb(14_15_20/0.14)]',
              isRail ? 'bg-brand-secondary' : 'border-r border-border bg-surface-elevated',
            )}
            style={{ zIndex: SIDE_SHEET_PANEL_Z_INDEX }}
          >
            <div className="mb-4 shrink-0">
              <BrandLogo href={brandHref} badge={badge} size="sm" inverted={isRail} />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{sidebar}</div>
          </nav>
        </div>
      </div>
    ) : null;

  return (
    <div className={cn('min-h-fluid-screen bg-background', className)}>
      {renderSiteHeader ? <SiteHeader /> : null}

      {isRail ? (
        <>
          {/*
            Full-width band under the floating header (stops at sidebar top),
            plus a slightly lower main-column clip so content starts vanishing
            below the header edge — never over the sidebar.
          */}
          {renderRailHeaderMask ? (
            <>
              <div
                className={cn(
                  'pointer-events-none fixed inset-x-0 top-0 z-[var(--z-sticky)] hidden md:block',
                  railMaskFillClass,
                  RAIL_HEADER_BAND_HEIGHT_CLASS,
                )}
                aria-hidden
              />
              <div
                className={cn(
                  'pointer-events-none fixed top-0 right-0 z-[var(--z-sticky)] hidden md:block',
                  'left-0',
                  railCollapsed ? 'md:left-[4.5rem]' : 'md:left-72',
                  PORTAL_RAIL_INSET_TRANSITION_CLASS,
                  railMaskFillClass,
                  RAIL_CONTENT_MASK_HEIGHT_CLASS,
                )}
                aria-hidden
              />
            </>
          ) : null}
          {railCollapseEnabled ? (
            <PortalRailDesktopAside
              sidebar={sidebar}
              collapsed={railCollapsed}
              expandLabel={railCollapseCopy.expand}
              collapseLabel={railCollapseCopy.collapse}
              onToggleCollapsed={toggleRailCollapsed}
            />
          ) : (
            <aside
              className={cn(
                'fixed left-0 z-[var(--z-sticky)] hidden overflow-hidden md:block',
                RAIL_CHROME_TOP_CLASS,
                RAIL_CHROME_BOTTOM_CLASS,
                PORTAL_RAIL_WIDTH_EXPANDED_CLASS,
              )}
            >
              <div
                className={cn(
                  'flex h-full min-h-0 flex-col overflow-hidden rounded-tr-[2.5rem] rounded-br-[2.5rem] bg-brand-secondary p-4',
                  MOBILE_BOTTOM_NAV_CONTENT_PB_CLASS,
                )}
              >
                {sidebar}
              </div>
            </aside>
          )}
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
        <div
          className={cn(
            'flex flex-col gap-8 md:flex-row md:gap-8 md:py-0',
            RAIL_ROW_GAP_CLASS,
            // Mobile profile hubs hide SiteHeader — keep top safe-area air without the desktop mask.
            (!renderRailHeaderMask || mobileDrawerControlledByNavbar) &&
              RAIL_ROW_GAP_PUBLIC_HEADER_MOBILE_CLASS,
          )}
        >
          {mobileDrawerControlledByNavbar ? (
            mobileHeader ? (
              <div className="page-container md:hidden">{mobileHeader}</div>
            ) : null
          ) : (
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
          )}
          <div
            className={cn(
              'hidden shrink-0 md:block',
              PORTAL_RAIL_WIDTH_TRANSITION_CLASS,
              railCollapseEnabled ? railWidthClass : PORTAL_RAIL_WIDTH_EXPANDED_CLASS,
            )}
            aria-hidden
          />
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

      {mobileDrawer ? createPortal(mobileDrawer, document.body) : null}
    </div>
  );
};
