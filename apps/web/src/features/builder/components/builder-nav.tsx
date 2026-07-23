'use client';

import {
  BarChart3,
  Building2,
  ClipboardCheck,
  FolderKanban,
  LayoutDashboard,
  QrCode,
  Settings,
  Users,
  Briefcase,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { LucideIcon } from 'lucide-react';

import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type NavItem = {
  href:
    | '/builder'
    | '/builder/projects'
    | '/builder/team'
    | '/builder/company'
    | '/builder/crm'
    | '/builder/scanner'
    | '/builder/readiness'
    | '/builder/analytics'
    | '/builder/settings';
  key:
    | 'dashboard'
    | 'projects'
    | 'team'
    | 'company'
    | 'crm'
    | 'scanner'
    | 'readiness'
    | 'analytics'
    | 'settings';
  icon: LucideIcon;
};

const PRIMARY_NAV_ITEMS: NavItem[] = [
  { href: '/builder', key: 'dashboard', icon: LayoutDashboard },
  { href: '/builder/projects', key: 'projects', icon: FolderKanban },
  { href: '/builder/team', key: 'team', icon: Users },
  { href: '/builder/company', key: 'company', icon: Building2 },
  { href: '/builder/crm', key: 'crm', icon: Briefcase },
  { href: '/builder/scanner', key: 'scanner', icon: QrCode },
  { href: '/builder/readiness', key: 'readiness', icon: ClipboardCheck },
  { href: '/builder/analytics', key: 'analytics', icon: BarChart3 },
];

const SETTINGS_NAV_ITEM: NavItem = {
  href: '/builder/settings',
  key: 'settings',
  icon: Settings,
};

const NAV_ICON_CLASS = 'size-5 shrink-0 opacity-90';

const navLinkClassName = (active: boolean): string =>
  cn(
    'flex items-center gap-3 rounded-pill px-3.5 py-2.5 text-base font-medium tracking-wide transition-colors',
    active
      ? 'bg-surface-elevated text-brand-secondary shadow-xs'
      : 'text-on-dark/85 hover:bg-on-dark/10 hover:text-on-dark',
  );

type BuilderNavProps = {
  companyName: string | null;
};

/**
 * Dark-rail builder navigation — same chrome pattern as AdminNav.
 */
export const BuilderNav = ({ companyName }: BuilderNavProps) => {
  const t = useTranslations('Builder.nav');
  const pathname = usePathname();

  const isItemActive = (href: string): boolean => {
    if (href === '/builder') {
      return pathname === '/builder';
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav aria-label={t('label')} className="flex h-full flex-col gap-1">
      <div className="mb-4 hidden px-3.5 pt-1 md:block">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-on-dark/65">
          {t('portalLabel')}
        </p>
        {companyName ? (
          <p className="mt-1 truncate text-sm font-medium text-on-dark">{companyName}</p>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1">
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

      <div className="mt-auto border-t border-on-dark/15 pt-3">
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
