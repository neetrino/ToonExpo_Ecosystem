'use client';

import { useTranslations } from 'next-intl';

import {
  BUILDER_PRIMARY_NAV_ITEMS,
  BUILDER_SETTINGS_NAV_ITEM,
} from '@/features/builder/builder-nav-items';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';
import {
  PORTAL_NAV_ACTIVE_ATTR,
  PortalNavRailGroup,
} from '@/shared/ui/portal-nav-rail-group';
import { usePortalRailCollapsed } from '@/shared/ui/portal-rail-collapse-context';

const NAV_ICON_CLASS = 'block size-5 shrink-0 opacity-90';

const navLinkClassName = (active: boolean, collapsed: boolean): string =>
  cn(
    'relative z-10 flex h-10 items-center rounded-pill font-medium tracking-wide leading-snug',
    'transition-colors duration-[var(--duration-base)] ease-[var(--ease-out-premium)]',
    'motion-reduce:transition-none',
    collapsed ? 'justify-center px-2' : 'gap-3 px-3.5 text-base',
    active
      ? 'text-brand-secondary'
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
  const railCollapsed = usePortalRailCollapsed();
  const SettingsIcon = BUILDER_SETTINGS_NAV_ITEM.icon;
  const measureKey = `${pathname}|${railCollapsed ? '1' : '0'}`;

  const isItemActive = (href: string): boolean => {
    if (href === '/builder') {
      return pathname === '/builder';
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav aria-label={t('label')} className="flex h-full min-h-0 flex-col gap-1">
      {companyName && !railCollapsed ? (
        <div className="mb-4 hidden shrink-0 px-1.5 md:block">
          <p className="truncate text-sm font-medium text-on-dark">{companyName}</p>
        </div>
      ) : null}

      <PortalNavRailGroup
        measureKey={measureKey}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        gapClassName="gap-1"
      >
        {BUILDER_PRIMARY_NAV_ITEMS.map((item) => {
          const active = isItemActive(item.href);
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

      <PortalNavRailGroup
        measureKey={measureKey}
        className="mt-auto shrink-0 border-t border-on-dark/15 pt-3"
        gapClassName="gap-1"
      >
        <Link
          href={BUILDER_SETTINGS_NAV_ITEM.href}
          className={navLinkClassName(isItemActive(BUILDER_SETTINGS_NAV_ITEM.href), railCollapsed)}
          aria-label={railCollapsed ? t(BUILDER_SETTINGS_NAV_ITEM.key) : undefined}
          title={railCollapsed ? t(BUILDER_SETTINGS_NAV_ITEM.key) : undefined}
          {...(isItemActive(BUILDER_SETTINGS_NAV_ITEM.href)
            ? { [PORTAL_NAV_ACTIVE_ATTR]: 'true' }
            : {})}
        >
          <SettingsIcon className={NAV_ICON_CLASS} aria-hidden />
          {railCollapsed ? (
            <span className="sr-only">{t(BUILDER_SETTINGS_NAV_ITEM.key)}</span>
          ) : (
            t(BUILDER_SETTINGS_NAV_ITEM.key)
          )}
        </Link>
      </PortalNavRailGroup>
    </nav>
  );
};
