'use client';

import { Heart, Inbox, LayoutDashboard, LogOut, QrCode, ScanLine, Settings } from 'lucide-react';
import type { AccountType } from '@toonexpo/contracts';
import type { LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useLogoutMutation } from '@/features/auth/hooks/use-auth';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';
import {
  PORTAL_NAV_ACTIVE_ATTR,
  PortalNavRailGroup,
} from '@/shared/ui/portal-nav-rail-group';
import { usePortalRailCollapsed } from '@/shared/ui/portal-rail-collapse-context';

type NavKey = 'dashboard' | 'password' | 'qr' | 'requests' | 'favorites' | 'checkin';

type NavItem = {
  href: '/dashboard' | '/settings' | '/qr' | '/requests' | '/favorites' | '/checkin';
  key: NavKey;
  buyerOnly: boolean;
  icon: LucideIcon;
};

const PRIMARY_NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', key: 'dashboard', buyerOnly: false, icon: LayoutDashboard },
  { href: '/qr', key: 'qr', buyerOnly: true, icon: QrCode },
  { href: '/favorites', key: 'favorites', buyerOnly: true, icon: Heart },
  { href: '/requests', key: 'requests', buyerOnly: true, icon: Inbox },
  { href: '/checkin', key: 'checkin', buyerOnly: true, icon: ScanLine },
];

const SETTINGS_NAV_ITEM: NavItem = {
  href: '/settings',
  key: 'password',
  buyerOnly: false,
  icon: Settings,
};

const NAV_ICON_CLASS = 'block size-5 shrink-0 opacity-90';

const EXACT_MATCH_HREFS = new Set(['/dashboard', '/settings', '/qr', '/checkin']);

const navLinkClassName = (active: boolean, collapsed: boolean): string =>
  cn(
    'relative z-10 flex h-10 items-center rounded-pill font-medium tracking-wide leading-none',
    'transition-colors duration-[var(--duration-base)] ease-[var(--ease-out-premium)]',
    'motion-reduce:transition-none',
    collapsed ? 'justify-center px-2' : 'gap-3 px-3.5 text-base',
    active
      ? 'text-brand-secondary'
      : 'text-on-dark/85 hover:bg-on-dark/10 hover:text-on-dark',
  );

const isActive = (pathname: string, href: string): boolean => {
  if (EXACT_MATCH_HREFS.has(href)) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
};

type AccountNavProps = {
  accountType: AccountType;
};

/**
 * Dark-rail account navigation — same chrome pattern as AdminNav, buyer-focused items.
 */
export const AccountNav = ({ accountType }: AccountNavProps) => {
  const t = useTranslations('Profile.nav');
  const tAuth = useTranslations('Auth');
  const pathname = usePathname();
  const railCollapsed = usePortalRailCollapsed();
  const logoutMutation = useLogoutMutation();
  const showBuyerTabs = accountType === 'buyer';
  const measureKey = `${pathname}|${railCollapsed ? '1' : '0'}|${showBuyerTabs ? '1' : '0'}`;

  const primaryItems = PRIMARY_NAV_ITEMS.filter((item) => !item.buyerOnly || showBuyerTabs);
  const settingsActive = isActive(pathname, SETTINGS_NAV_ITEM.href);

  return (
    <nav aria-label={t('label')} className="flex h-full min-h-0 flex-col gap-1">
      <PortalNavRailGroup
        measureKey={measureKey}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        gapClassName="gap-1"
      >
        {primaryItems.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          const label = t(item.key);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={navLinkClassName(active, railCollapsed)}
              aria-label={railCollapsed ? label : undefined}
              title={railCollapsed ? label : undefined}
              {...(active ? { [PORTAL_NAV_ACTIVE_ATTR]: 'true' } : {})}
            >
              <Icon className={NAV_ICON_CLASS} aria-hidden />
              {railCollapsed ? <span className="sr-only">{label}</span> : label}
            </Link>
          );
        })}
      </PortalNavRailGroup>

      <div className="mt-auto flex shrink-0 flex-col gap-1 border-t border-on-dark/15 pt-3">
        <PortalNavRailGroup measureKey={measureKey} gapClassName="gap-1">
          <Link
            href={SETTINGS_NAV_ITEM.href}
            className={navLinkClassName(settingsActive, railCollapsed)}
            aria-label={railCollapsed ? t(SETTINGS_NAV_ITEM.key) : undefined}
            title={railCollapsed ? t(SETTINGS_NAV_ITEM.key) : undefined}
            {...(settingsActive ? { [PORTAL_NAV_ACTIVE_ATTR]: 'true' } : {})}
          >
            <Settings className={NAV_ICON_CLASS} aria-hidden />
            {railCollapsed ? (
              <span className="sr-only">{t(SETTINGS_NAV_ITEM.key)}</span>
            ) : (
              t(SETTINGS_NAV_ITEM.key)
            )}
          </Link>
        </PortalNavRailGroup>
        <button
          type="button"
          className={cn(
            navLinkClassName(false, railCollapsed),
            'w-full text-left disabled:pointer-events-none disabled:opacity-50',
          )}
          disabled={logoutMutation.isPending}
          aria-label={
            railCollapsed
              ? logoutMutation.isPending
                ? tAuth('logout.submitting')
                : tAuth('logout.submit')
              : undefined
          }
          title={
            railCollapsed
              ? logoutMutation.isPending
                ? tAuth('logout.submitting')
                : tAuth('logout.submit')
              : undefined
          }
          onClick={() => {
            void logoutMutation.mutateAsync();
          }}
        >
          <LogOut className={NAV_ICON_CLASS} aria-hidden />
          {railCollapsed ? (
            <span className="sr-only">
              {logoutMutation.isPending ? tAuth('logout.submitting') : tAuth('logout.submit')}
            </span>
          ) : logoutMutation.isPending ? (
            tAuth('logout.submitting')
          ) : (
            tAuth('logout.submit')
          )}
        </button>
      </div>
    </nav>
  );
};
