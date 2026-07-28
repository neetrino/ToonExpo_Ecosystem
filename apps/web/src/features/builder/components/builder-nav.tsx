'use client';

import { useTranslations } from 'next-intl';

import {
  BUILDER_PRIMARY_NAV_ITEMS,
  BUILDER_SETTINGS_NAV_ITEM,
} from '@/features/builder/builder-nav-items';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

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
  const SettingsIcon = BUILDER_SETTINGS_NAV_ITEM.icon;

  const isItemActive = (href: string): boolean => {
    if (href === '/builder') {
      return pathname === '/builder';
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav aria-label={t('label')} className="flex h-full min-h-0 flex-col gap-1">
      <div className="mb-4 hidden shrink-0 px-3.5 pt-1 md:block">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-on-dark/65">
          {t('portalLabel')}
        </p>
        {companyName ? (
          <p className="mt-1 truncate text-sm font-medium text-on-dark">{companyName}</p>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain">
        {BUILDER_PRIMARY_NAV_ITEMS.map((item) => {
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
          href={BUILDER_SETTINGS_NAV_ITEM.href}
          className={navLinkClassName(isItemActive(BUILDER_SETTINGS_NAV_ITEM.href))}
        >
          <SettingsIcon className={NAV_ICON_CLASS} aria-hidden />
          {t(BUILDER_SETTINGS_NAV_ITEM.key)}
        </Link>
      </div>
    </nav>
  );
};
