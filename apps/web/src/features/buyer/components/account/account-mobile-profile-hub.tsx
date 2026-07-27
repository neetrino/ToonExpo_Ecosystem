'use client';

import type { AccountType } from '@toonexpo/contracts';
import {
  ChevronRight,
  Heart,
  Inbox,
  LayoutDashboard,
  LogOut,
  QrCode,
  ScanLine,
  Settings,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useLogoutMutation } from '@/features/auth/hooks/use-auth';
import { Link } from '@/i18n/navigation';
import { getAccountInitials } from '@/shared/lib/account-initials';
import { cn } from '@/shared/ui/cn';

const AVATAR_SIZE_CLASS = 'size-16';
const ICON_BOX_CLASS = 'size-10 rounded-xl';
const CARD_CLASS = 'rounded-[15px] bg-surface-elevated shadow-xs ring-1 ring-border/70';

type NavKey = 'dashboard' | 'password' | 'qr' | 'requests' | 'favorites' | 'checkin';

type NavItem = {
  href: '/dashboard' | '/settings' | '/qr' | '/requests' | '/favorites' | '/checkin';
  key: NavKey;
  buyerOnly: boolean;
  icon: LucideIcon;
  iconTone: string;
};

const MENU_ITEMS: ReadonlyArray<NavItem> = [
  {
    href: '/dashboard',
    key: 'dashboard',
    buyerOnly: false,
    icon: LayoutDashboard,
    iconTone: 'bg-brand-soft text-brand',
  },
  {
    href: '/qr',
    key: 'qr',
    buyerOnly: true,
    icon: QrCode,
    iconTone: 'bg-brand-secondary/12 text-brand-secondary',
  },
  {
    href: '/favorites',
    key: 'favorites',
    buyerOnly: true,
    icon: Heart,
    iconTone: 'bg-danger/10 text-danger',
  },
  {
    href: '/requests',
    key: 'requests',
    buyerOnly: true,
    icon: Inbox,
    iconTone: 'bg-brand-soft text-brand',
  },
  {
    href: '/checkin',
    key: 'checkin',
    buyerOnly: true,
    icon: ScanLine,
    iconTone: 'bg-brand-secondary/12 text-brand-secondary',
  },
  {
    href: '/settings',
    key: 'password',
    buyerOnly: false,
    icon: Settings,
    iconTone: 'bg-ink-muted/10 text-ink-label',
  },
];

type AccountMobileProfileHubProps = {
  name: string;
  email: string;
  accountType: AccountType;
  className?: string | undefined;
};

/**
 * MaMarie-style mobile profile hub: avatar + name, then sidebar nav as page body.
 * No active-row highlight — this hub only mounts on `/dashboard`, so Dashboard
 * would otherwise look permanently selected.
 */
export const AccountMobileProfileHub = ({
  name,
  email,
  accountType,
  className,
}: AccountMobileProfileHubProps) => {
  const t = useTranslations('Profile.nav');
  const tAuth = useTranslations('Auth');
  const logoutMutation = useLogoutMutation();
  const showBuyerTabs = accountType === 'buyer';
  const items = MENU_ITEMS.filter((item) => !item.buyerOnly || showBuyerTabs);

  return (
    <div className={cn('mx-auto flex w-full max-w-md flex-col gap-4', className)}>
      <section className={cn(CARD_CLASS, 'px-4 py-4')} aria-label={t('label')}>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'flex shrink-0 items-center justify-center rounded-full bg-brand',
              'text-lg font-semibold tracking-wide text-on-brand shadow-xs',
              AVATAR_SIZE_CLASS,
            )}
            aria-hidden
          >
            {getAccountInitials(name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xl font-bold leading-tight text-ink">{name}</p>
            <p className="truncate text-sm leading-snug text-ink-muted">{email}</p>
          </div>
        </div>
      </section>

      <nav className={cn(CARD_CLASS, 'overflow-hidden py-1')} aria-label={t('label')}>
        <ul className="divide-y divide-border/60">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex w-full items-center justify-between px-4 py-3.5 transition-colors hover:bg-canvas"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span
                      className={cn(
                        'inline-flex shrink-0 items-center justify-center',
                        ICON_BOX_CLASS,
                        item.iconTone,
                      )}
                    >
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span className="truncate text-base font-medium text-ink">{t(item.key)}</span>
                  </span>
                  <ChevronRight className="size-[18px] shrink-0 text-ink-muted" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <button
        type="button"
        className={cn(
          'flex w-full items-center justify-center gap-2.5 rounded-[15px] bg-brand-secondary',
          'py-3.5 text-base font-semibold text-on-dark transition-opacity',
          'hover:opacity-90 disabled:pointer-events-none disabled:opacity-50',
        )}
        disabled={logoutMutation.isPending}
        onClick={() => {
          void logoutMutation.mutateAsync();
        }}
      >
        <LogOut className="size-5 shrink-0" aria-hidden />
        <span>
          {logoutMutation.isPending ? tAuth('logout.submitting') : tAuth('logout.submit')}
        </span>
      </button>
    </div>
  );
};
