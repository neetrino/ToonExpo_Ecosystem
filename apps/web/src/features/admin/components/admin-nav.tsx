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
  { href: '/checkin', key: 'checkin', icon: ScanLine },
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
 * Compact sidebar nav for the platform admin area.
 */
export const AdminNav = () => {
  const t = useTranslations('Admin.nav');
  const pathname = usePathname();

  return (
    <nav aria-label={t('label')} className="flex flex-col gap-1">
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-ink-muted">
        {t('section')}
      </p>
      {NAV_ITEMS.map((item) => {
        const active = pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2.5 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'bg-brand-soft text-brand'
                : 'text-ink-secondary hover:bg-surface hover:text-ink',
            )}
          >
            <Icon className="size-4 shrink-0 opacity-80" aria-hidden />
            {t(item.key)}
          </Link>
        );
      })}
    </nav>
  );
};
