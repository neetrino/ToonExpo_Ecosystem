'use client';

import { Heart, KeyRound, QrCode, ScanLine, UserRound, Inbox } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { isBuyerAccount } from '@/features/buyer/utils/is-buyer-account';
import { useMeQuery } from '@/features/auth/hooks/use-auth';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type NavKey = 'profile' | 'password' | 'qr' | 'requests' | 'favorites' | 'checkin';

type NavItem = {
  href:
    | '/profile'
    | '/profile/password'
    | '/profile/qr'
    | '/profile/requests'
    | '/profile/favorites'
    | '/profile/checkin';
  key: NavKey;
  buyerOnly: boolean;
  icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
  { href: '/profile', key: 'profile', buyerOnly: false, icon: UserRound },
  { href: '/profile/password', key: 'password', buyerOnly: false, icon: KeyRound },
  { href: '/profile/favorites', key: 'favorites', buyerOnly: true, icon: Heart },
  { href: '/profile/checkin', key: 'checkin', buyerOnly: true, icon: ScanLine },
  { href: '/profile/qr', key: 'qr', buyerOnly: true, icon: QrCode },
  { href: '/profile/requests', key: 'requests', buyerOnly: true, icon: Inbox },
];

const isActive = (pathname: string, href: string): boolean => {
  if (href === '/profile') {
    return pathname === '/profile';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
};

/**
 * Horizontal cabinet tabs for the buyer profile area (mobile-first).
 */
export const ProfileNav = () => {
  const t = useTranslations('Profile.nav');
  const pathname = usePathname();
  const { data: user } = useMeQuery();
  const showBuyerTabs = isBuyerAccount(user);

  const items = NAV_ITEMS.filter((item) => !item.buyerOnly || showBuyerTabs);

  return (
    <nav aria-label={t('label')} className="-mx-1 flex gap-1.5 overflow-x-auto pb-1">
      {items.map((item) => {
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
