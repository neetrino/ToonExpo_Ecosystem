'use client';

import { KeyRound, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type NavItem = {
  href: '/admin/settings' | '/admin/settings/password';
  key: 'profile' | 'password';
  icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
  { href: '/admin/settings', key: 'profile', icon: UserRound },
  { href: '/admin/settings/password', key: 'password', icon: KeyRound },
];

const isActive = (pathname: string, href: string): boolean => {
  if (href === '/admin/settings') {
    return pathname === '/admin/settings';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
};

/**
 * Section tabs for the admin account settings area.
 */
export const AdminSettingsNav = () => {
  const t = useTranslations('Admin.settings.nav');
  const pathname = usePathname();

  return (
    <nav aria-label={t('label')} className="-mx-1 flex gap-1.5 overflow-x-auto pb-1">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-pill px-3.5 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'bg-brand text-on-brand shadow-xs'
                : 'bg-surface text-ink-secondary hover:text-ink',
            )}
          >
            <Icon className="size-3.5 opacity-90" aria-hidden />
            {t(item.key)}
          </Link>
        );
      })}
    </nav>
  );
};
