'use client';

import {
  Building2,
  CalendarDays,
  ClipboardCheck,
  Handshake,
  Landmark,
  LayoutList,
  LineChart,
  ScanLine,
  Settings,
  Tags,
  Workflow,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type NavItem = {
  href: string;
  key:
    | 'analytics'
    | 'companies'
    | 'checkin'
    | 'partners'
    | 'bankOffers'
    | 'serviceProviders'
    | 'readiness'
    | 'readinessCategories'
    | 'bos'
    | 'events'
    | 'settings';
  icon: LucideIcon;
};

const PRIMARY_NAV_ITEMS: NavItem[] = [
  { href: '/admin/analytics', key: 'analytics', icon: LineChart },
  { href: '/admin/companies', key: 'companies', icon: Building2 },
  { href: '/admin/checkin', key: 'checkin', icon: ScanLine },
  { href: '/admin/partners', key: 'partners', icon: Handshake },
  { href: '/admin/bank-offers', key: 'bankOffers', icon: Landmark },
  {
    href: '/admin/service-providers',
    key: 'serviceProviders',
    icon: LayoutList,
  },
  { href: '/admin/readiness', key: 'readiness', icon: ClipboardCheck },
  {
    href: '/admin/readiness/categories',
    key: 'readinessCategories',
    icon: Tags,
  },
  { href: '/admin/integrations/bos', key: 'bos', icon: Workflow },
  { href: '/admin/events', key: 'events', icon: CalendarDays },
];

const SETTINGS_NAV_ITEM: NavItem = {
  href: '/admin/settings',
  key: 'settings',
  icon: Settings,
};

const ALL_NAV_ITEMS: NavItem[] = [...PRIMARY_NAV_ITEMS, SETTINGS_NAV_ITEM];

const NAV_ICON_CLASS = 'size-5 shrink-0 opacity-90';

const navLinkClassName = (active: boolean): string =>
  cn(
    'flex items-center gap-3 rounded-pill px-3.5 py-2.5 text-base font-medium tracking-wide transition-colors',
    active
      ? 'bg-surface-elevated text-brand-secondary shadow-xs'
      : 'text-on-dark/85 hover:bg-on-dark/10 hover:text-on-dark',
  );

/**
 * Compact sidebar nav for the platform admin rail.
 */
export const AdminNav = () => {
  const t = useTranslations('Admin.nav');
  const pathname = usePathname();

  const isItemActive = (href: string): boolean => {
    if (pathname === href) {
      return true;
    }
    if (!pathname.startsWith(`${href}/`)) {
      return false;
    }
    // Prefer a more specific nav item (e.g. Categories over Readiness).
    return !ALL_NAV_ITEMS.some(
      (item) =>
        item.href !== href &&
        item.href.startsWith(`${href}/`) &&
        (pathname === item.href || pathname.startsWith(`${item.href}/`)),
    );
  };

  return (
    <nav aria-label={t('label')} className="flex h-full min-h-0 flex-col gap-1">
      <div className="mb-4 hidden shrink-0 px-3.5 pt-1 md:block">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-on-dark/65">
          {t('portalLabel')}
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain">
        {PRIMARY_NAV_ITEMS.map((item) => {
          const active = isItemActive(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={navLinkClassName(active)}>
              <Icon className={NAV_ICON_CLASS} aria-hidden />
              {t(item.key)}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto shrink-0 border-t border-on-dark/15 pt-3">
        <Link
          href={SETTINGS_NAV_ITEM.href}
          className={navLinkClassName(isItemActive(SETTINGS_NAV_ITEM.href))}
        >
          <Settings className={NAV_ICON_CLASS} aria-hidden />
          {t(SETTINGS_NAV_ITEM.key)}
        </Link>
      </div>
    </nav>
  );
};
