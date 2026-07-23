'use client';

import {
  Building,
  Building2,
  CalendarDays,
  ChevronDown,
  ClipboardCheck,
  FolderKanban,
  Handshake,
  Home,
  Landmark,
  Layers,
  LayoutList,
  LineChart,
  ScanLine,
  Settings,
  Tags,
  Workflow,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type NavItem = {
  href: string;
  key:
    | 'analytics'
    | 'companies'
    | 'projects'
    | 'buildings'
    | 'floors'
    | 'apartments'
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
  children?: NavItem[];
};

const PROJECTS_HREF = '/admin/projects';

const PROJECT_CHILD_NAV_ITEMS: NavItem[] = [
  { href: '/admin/projects/buildings', key: 'buildings', icon: Building },
  { href: '/admin/projects/floors', key: 'floors', icon: Layers },
  { href: '/admin/projects/apartments', key: 'apartments', icon: Home },
];

const PRIMARY_NAV_ITEMS: NavItem[] = [
  { href: '/admin/analytics', key: 'analytics', icon: LineChart },
  { href: '/admin/companies', key: 'companies', icon: Building2 },
  {
    href: PROJECTS_HREF,
    key: 'projects',
    icon: FolderKanban,
    children: PROJECT_CHILD_NAV_ITEMS,
  },
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

const ALL_NAV_ITEMS: NavItem[] = [
  ...PRIMARY_NAV_ITEMS.flatMap((item) => [item, ...(item.children ?? [])]),
  SETTINGS_NAV_ITEM,
];

const NAV_ICON_CLASS = 'size-5 shrink-0 opacity-90';
const NAV_CHILD_ICON_CLASS = 'size-4 shrink-0 opacity-90';

const isProjectsSectionPath = (pathname: string): boolean =>
  pathname === PROJECTS_HREF || pathname.startsWith(`${PROJECTS_HREF}/`);

const navLinkClassName = (active: boolean, nested = false): string =>
  cn(
    'flex items-center gap-3 rounded-pill font-medium tracking-wide transition-colors',
    nested ? 'gap-2.5 px-3.5 py-2 text-sm' : 'px-3.5 py-2.5 text-base',
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
  const [projectsOpen, setProjectsOpen] = useState(() => isProjectsSectionPath(pathname));

  useEffect(() => {
    setProjectsOpen(isProjectsSectionPath(pathname));
  }, [pathname]);

  const isItemActive = (href: string): boolean => {
    if (pathname === href) {
      return true;
    }
    if (!pathname.startsWith(`${href}/`)) {
      return false;
    }
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
          const hasChildren = Boolean(item.children?.length);

          if (!hasChildren || !item.children) {
            return (
              <Link key={item.href} href={item.href} className={navLinkClassName(active)}>
                <Icon className={NAV_ICON_CLASS} aria-hidden />
                {t(item.key)}
              </Link>
            );
          }

          return (
            <div key={item.href} className="flex flex-col gap-0.5">
              <div className={cn(navLinkClassName(active), 'pr-2')}>
                <Link
                  href={item.href}
                  className="flex min-w-0 flex-1 items-center gap-3 text-inherit"
                >
                  <Icon className={NAV_ICON_CLASS} aria-hidden />
                  <span className="truncate">{t(item.key)}</span>
                </Link>
                <button
                  type="button"
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-pill text-inherit hover:bg-on-dark/10"
                  aria-expanded={projectsOpen}
                  aria-controls="admin-projects-subnav"
                  aria-label={t('projects')}
                  onClick={() => {
                    setProjectsOpen((open) => !open);
                  }}
                >
                  <ChevronDown
                    className={cn(
                      'size-4 transition-transform duration-[var(--duration-fast)]',
                      projectsOpen ? 'rotate-0' : '-rotate-90',
                    )}
                    aria-hidden
                  />
                </button>
              </div>

              {projectsOpen ? (
                <div id="admin-projects-subnav" className="ml-4 flex flex-col gap-0.5 pl-2">
                  {item.children.map((child) => {
                    const childActive = isItemActive(child.href);
                    const ChildIcon = child.icon;
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={navLinkClassName(childActive, true)}
                      >
                        <ChildIcon className={NAV_CHILD_ICON_CLASS} aria-hidden />
                        {t(child.key)}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
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
