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
  Tags,
  Workflow,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { BrandLogo } from '@/shared/ui/brand-logo';
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
    | 'events';
  icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
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
    return !NAV_ITEMS.some(
      (item) =>
        item.href !== href &&
        item.href.startsWith(`${href}/`) &&
        (pathname === item.href || pathname.startsWith(`${item.href}/`)),
    );
  };

  return (
    <nav aria-label={t('label')} className="flex h-full flex-col gap-1">
      <div className="mb-5 hidden px-2 md:block">
        <BrandLogo href="/admin" size="sm" inverted />
        <p className="mt-2 px-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-on-dark/65">
          {t('portalLabel')}
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = isItemActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 rounded-pill px-3.5 py-2.5 text-sm font-medium tracking-wide transition-colors',
                active
                  ? 'bg-surface-elevated text-brand-secondary shadow-xs'
                  : 'text-on-dark/85 hover:bg-on-dark/10 hover:text-on-dark',
              )}
            >
              <Icon className="size-4 shrink-0 opacity-90" aria-hidden />
              {t(item.key)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
