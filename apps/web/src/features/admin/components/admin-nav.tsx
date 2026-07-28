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
  Users,
  Workflow,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type NavItemKey =
  | 'analytics'
  | 'companies'
  | 'users'
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

type NavItem = {
  href: string;
  key: NavItemKey;
  icon: LucideIcon;
  children?: NavItem[];
};

const PROJECTS_HREF = '/admin/projects';
const READINESS_HREF = '/admin/readiness';
const SERVICE_PROVIDERS_HREF = '/admin/service-providers';
const BOS_HREF = '/admin/integrations/bos';

const PROJECT_CHILD_NAV_ITEMS: NavItem[] = [
  { href: '/admin/projects/buildings', key: 'buildings', icon: Building },
  { href: '/admin/projects/floors', key: 'floors', icon: Layers },
  { href: '/admin/projects/apartments', key: 'apartments', icon: Home },
];

const READINESS_CHILD_NAV_ITEMS: NavItem[] = [
  { href: SERVICE_PROVIDERS_HREF, key: 'serviceProviders', icon: LayoutList },
  { href: '/admin/readiness/categories', key: 'readinessCategories', icon: Tags },
];

const SETTINGS_CHILD_NAV_ITEMS: NavItem[] = [{ href: BOS_HREF, key: 'bos', icon: Workflow }];

const PRIMARY_NAV_ITEMS: NavItem[] = [
  { href: '/admin/analytics', key: 'analytics', icon: LineChart },
  { href: '/admin/companies', key: 'companies', icon: Building2 },
  { href: '/admin/users', key: 'users', icon: Users },
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
    href: READINESS_HREF,
    key: 'readiness',
    icon: ClipboardCheck,
    children: READINESS_CHILD_NAV_ITEMS,
  },
  { href: '/admin/events', key: 'events', icon: CalendarDays },
];

const SETTINGS_NAV_ITEM: NavItem = {
  href: '/admin/settings',
  key: 'settings',
  icon: Settings,
  children: SETTINGS_CHILD_NAV_ITEMS,
};

const SECTION_NAV_ITEMS: NavItem[] = [...PRIMARY_NAV_ITEMS, SETTINGS_NAV_ITEM];

const ALL_NAV_ITEMS: NavItem[] = SECTION_NAV_ITEMS.flatMap((item) => [
  item,
  ...(item.children ?? []),
]);

const NAV_ICON_CLASS = 'size-[1.125rem] shrink-0 opacity-90';
const NAV_CHILD_ICON_CLASS = 'size-4 shrink-0 opacity-90';

const isPathInSection = (pathname: string, item: NavItem): boolean => {
  if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
    return true;
  }
  return (item.children ?? []).some(
    (child) => pathname === child.href || pathname.startsWith(`${child.href}/`),
  );
};

const initialOpenSections = (pathname: string): Record<string, boolean> => {
  const open: Record<string, boolean> = {};
  for (const item of SECTION_NAV_ITEMS) {
    if (item.children?.length) {
      open[item.key] = isPathInSection(pathname, item);
    }
  }
  return open;
};

const navLinkClassName = (active: boolean, nested = false): string =>
  cn(
    'flex items-center gap-2.5 rounded-pill font-medium tracking-wide transition-colors',
    nested ? 'gap-2.5 px-3.5 py-1.5 text-sm' : 'px-3.5 py-2 text-[0.9375rem]',
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
  const [openSections, setOpenSections] = useState(() => initialOpenSections(pathname));

  useEffect(() => {
    setOpenSections((prev) => {
      const next = { ...prev };
      for (const item of SECTION_NAV_ITEMS) {
        if (item.children?.length && isPathInSection(pathname, item)) {
          next[item.key] = true;
        }
      }
      return next;
    });
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

  const toggleSection = (key: NavItemKey): void => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderNavItem = (item: NavItem) => {
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

    const sectionOpen = Boolean(openSections[item.key]);
    const subnavId = `admin-${item.key}-subnav`;

    return (
      <div key={item.href} className="flex flex-col gap-0.5">
        <div className={cn(navLinkClassName(active), 'pr-2')}>
          <Link href={item.href} className="flex min-w-0 flex-1 items-center gap-2.5 text-inherit">
            <Icon className={NAV_ICON_CLASS} aria-hidden />
            <span className="truncate">{t(item.key)}</span>
          </Link>
          <button
            type="button"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-pill text-inherit hover:bg-on-dark/10"
            aria-expanded={sectionOpen}
            aria-controls={subnavId}
            aria-label={t(item.key)}
            onClick={() => {
              toggleSection(item.key);
            }}
          >
            <ChevronDown
              className={cn(
                'size-4 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-premium)] motion-reduce:transition-none',
                sectionOpen ? 'rotate-0' : '-rotate-90',
              )}
              aria-hidden
            />
          </button>
        </div>

        <div
          className={cn(
            'grid transition-[grid-template-rows,opacity] duration-[var(--duration-base)] ease-[var(--ease-out-premium)] motion-reduce:transition-none',
            sectionOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div
              id={subnavId}
              className="ml-4 flex flex-col gap-0.5 pl-2"
              aria-hidden={!sectionOpen}
              inert={!sectionOpen}
            >
              {item.children.map((child) => {
                const childActive = isItemActive(child.href);
                const ChildIcon = child.icon;
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={navLinkClassName(childActive, true)}
                    tabIndex={sectionOpen ? undefined : -1}
                  >
                    <ChildIcon className={NAV_CHILD_ICON_CLASS} aria-hidden />
                    {t(child.key)}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <nav aria-label={t('label')} className="flex h-full min-h-0 flex-col gap-1">
      <div className="mb-3 hidden shrink-0 px-3.5 pt-1 md:block">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-on-dark/65">
          {t('portalLabel')}
        </p>
      </div>

      <div className="scrollbar-none flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain">
        {PRIMARY_NAV_ITEMS.map(renderNavItem)}
      </div>

      <div className="mt-auto shrink-0 border-t border-on-dark/15 pt-2.5">
        {renderNavItem(SETTINGS_NAV_ITEM)}
      </div>
    </nav>
  );
};
