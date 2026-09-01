'use client';

import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import {
  ADMIN_ALL_NAV_ITEMS,
  ADMIN_PRIMARY_NAV_ITEMS,
  ADMIN_SECTION_NAV_ITEMS,
  ADMIN_SETTINGS_NAV_ITEM,
  type AdminNavItem,
  type AdminNavItemKey,
} from '@/features/admin/admin-nav-items';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';
import {
  PORTAL_NAV_ACTIVE_ATTR,
  PortalNavRailGroup,
} from '@/shared/ui/portal-nav-rail-group';
import { usePortalRailCollapsed } from '@/shared/ui/portal-rail-collapse-context';

const NAV_ICON_CLASS = 'block size-[1.125rem] shrink-0 opacity-90';
const NAV_CHILD_ICON_CLASS = 'block size-4 shrink-0 opacity-90';

const isPathInSection = (pathname: string, item: AdminNavItem): boolean => {
  if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
    return true;
  }
  return (item.children ?? []).some(
    (child) => pathname === child.href || pathname.startsWith(`${child.href}/`),
  );
};

const initialOpenSections = (pathname: string): Record<string, boolean> => {
  const open: Record<string, boolean> = {};
  for (const item of ADMIN_SECTION_NAV_ITEMS) {
    if (item.children?.length) {
      open[item.key] = isPathInSection(pathname, item);
    }
  }
  return open;
};

const navLinkClassName = (active: boolean, collapsed: boolean, nested = false): string =>
  cn(
    'relative z-10 flex items-center justify-start rounded-pill font-medium tracking-wide',
    'transition-colors duration-[var(--duration-base)] ease-[var(--ease-out-premium)]',
    'motion-reduce:transition-none',
    collapsed
      ? 'h-10 justify-center px-2'
      : nested
        ? 'h-9 gap-2.5 px-3.5 text-sm leading-snug'
        : 'h-10 gap-2.5 px-3.5 text-[0.9375rem] leading-snug',
    active
      ? 'text-brand'
      : 'text-on-dark/85 hover:bg-on-dark/10 hover:text-on-dark',
  );

/**
 * Compact sidebar nav for the platform admin rail.
 */
export const AdminNav = () => {
  const t = useTranslations('Admin.nav');
  const pathname = usePathname();
  const railCollapsed = usePortalRailCollapsed();
  const [openSections, setOpenSections] = useState(() => initialOpenSections(pathname));

  useEffect(() => {
    setOpenSections((prev) => {
      const next = { ...prev };
      for (const item of ADMIN_SECTION_NAV_ITEMS) {
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
    return !ADMIN_ALL_NAV_ITEMS.some(
      (item) =>
        item.href !== href &&
        item.href.startsWith(`${href}/`) &&
        (pathname === item.href || pathname.startsWith(`${item.href}/`)),
    );
  };

  const toggleSection = (key: AdminNavItemKey): void => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const openSectionsKey = ADMIN_SECTION_NAV_ITEMS.map(
    (item) => `${item.key}:${openSections[item.key] ? '1' : '0'}`,
  ).join('|');
  const measureKey = `${pathname}|${railCollapsed ? '1' : '0'}|${openSectionsKey}`;

  const renderNavItem = (item: AdminNavItem) => {
    const active = isItemActive(item.href);
    const Icon = item.icon;
    const hasChildren = Boolean(item.children?.length);

    if (!hasChildren || !item.children) {
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
          {railCollapsed ? <span className="sr-only">{label}</span> : <span>{label}</span>}
        </Link>
      );
    }

    if (railCollapsed) {
      const label = t(item.key);
      return (
        <Link
          key={item.href}
          href={item.href}
          className={navLinkClassName(active, railCollapsed)}
          aria-label={label}
          title={label}
          {...(active ? { [PORTAL_NAV_ACTIVE_ATTR]: 'true' } : {})}
        >
          <Icon className={NAV_ICON_CLASS} aria-hidden />
          <span className="sr-only">{label}</span>
        </Link>
      );
    }

    const sectionOpen = Boolean(openSections[item.key]);
    const subnavId = `admin-${item.key}-subnav`;

    return (
      <div key={item.href} className="flex flex-col gap-0.5">
        <div
          className={cn(navLinkClassName(active, railCollapsed), 'pr-1.5')}
          {...(active ? { [PORTAL_NAV_ACTIVE_ATTR]: 'true' } : {})}
        >
          <Link
            href={item.href}
            className="flex h-full min-w-0 flex-1 items-center gap-2.5 leading-snug text-inherit"
          >
            <Icon className={NAV_ICON_CLASS} aria-hidden />
            <span className="truncate">{t(item.key)}</span>
          </Link>
          <button
            type="button"
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-pill leading-none text-inherit hover:bg-on-dark/10"
            aria-expanded={sectionOpen}
            aria-controls={subnavId}
            aria-label={t(item.key)}
            onClick={() => {
              toggleSection(item.key);
            }}
          >
            <ChevronDown
              className={cn(
                'block size-4 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-premium)] motion-reduce:transition-none',
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
                    className={navLinkClassName(childActive, railCollapsed, true)}
                    tabIndex={sectionOpen ? undefined : -1}
                    {...(childActive ? { [PORTAL_NAV_ACTIVE_ATTR]: 'true' } : {})}
                  >
                    <ChildIcon className={NAV_CHILD_ICON_CLASS} aria-hidden />
                    <span>{t(child.key)}</span>
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
      <PortalNavRailGroup
        measureKey={measureKey}
        className="scrollbar-none min-h-0 flex-1 overflow-y-auto overscroll-contain"
        gapClassName="gap-0.5"
      >
        {ADMIN_PRIMARY_NAV_ITEMS.map(renderNavItem)}
      </PortalNavRailGroup>

      <PortalNavRailGroup
        measureKey={measureKey}
        className="mt-auto shrink-0 border-t border-on-dark/15 pt-2.5 pb-0.5"
        gapClassName="gap-0.5"
      >
        {renderNavItem(ADMIN_SETTINGS_NAV_ITEM)}
      </PortalNavRailGroup>
    </nav>
  );
};
