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
import { usePortalRailCollapsed } from '@/shared/ui/portal-rail-collapse-context';

const NAV_ICON_CLASS = 'size-[1.125rem] shrink-0 opacity-90';
const NAV_CHILD_ICON_CLASS = 'size-4 shrink-0 opacity-90';

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
    'flex items-center rounded-pill font-medium tracking-wide transition-colors',
    collapsed
      ? 'justify-center px-2 py-2'
      : nested
        ? 'gap-2.5 px-3.5 py-1.5 text-sm'
        : 'gap-2.5 px-3.5 py-2 text-[0.9375rem]',
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
        >
          <Icon className={NAV_ICON_CLASS} aria-hidden />
          {railCollapsed ? <span className="sr-only">{label}</span> : label}
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
        <div className={cn(navLinkClassName(active, railCollapsed), 'pr-2')}>
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
                    className={navLinkClassName(childActive, railCollapsed, true)}
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
      <div className="scrollbar-none flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain">
        {ADMIN_PRIMARY_NAV_ITEMS.map(renderNavItem)}
      </div>

      <div className="mt-auto shrink-0 border-t border-on-dark/15 pt-2.5">
        {renderNavItem(ADMIN_SETTINGS_NAV_ITEM)}
      </div>
    </nav>
  );
};
