'use client';

import { Heart, Inbox, LayoutDashboard, LogOut, QrCode, ScanLine, Settings } from 'lucide-react';
import type { AccountType } from '@toonexpo/contracts';
import type { LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { AccountUserSummary } from '@/features/buyer/components/account/account-user-summary';
import { useLogoutMutation } from '@/features/auth/hooks/use-auth';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type NavKey = 'dashboard' | 'password' | 'qr' | 'requests' | 'favorites' | 'checkin';

type NavItem = {
  href: '/dashboard' | '/settings' | '/qr' | '/requests' | '/favorites' | '/checkin';
  key: NavKey;
  buyerOnly: boolean;
  icon: LucideIcon;
};

const PRIMARY_NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', key: 'dashboard', buyerOnly: false, icon: LayoutDashboard },
  { href: '/qr', key: 'qr', buyerOnly: true, icon: QrCode },
  { href: '/favorites', key: 'favorites', buyerOnly: true, icon: Heart },
  { href: '/requests', key: 'requests', buyerOnly: true, icon: Inbox },
  { href: '/checkin', key: 'checkin', buyerOnly: true, icon: ScanLine },
];

const SETTINGS_NAV_ITEM: NavItem = {
  href: '/settings',
  key: 'password',
  buyerOnly: false,
  icon: Settings,
};

const NAV_ICON_CLASS = 'size-5 shrink-0 opacity-90';

const EXACT_MATCH_HREFS = new Set(['/dashboard', '/settings', '/qr', '/checkin']);

const navLinkClassName = (active: boolean): string =>
  cn(
    'flex items-center gap-3 rounded-pill px-3.5 py-2.5 text-base font-medium tracking-wide transition-colors',
    active
      ? 'bg-surface-elevated text-brand-secondary shadow-xs'
      : 'text-on-dark/85 hover:bg-on-dark/10 hover:text-on-dark',
  );

const isActive = (pathname: string, href: string): boolean => {
  if (EXACT_MATCH_HREFS.has(href)) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
};

type AccountNavProps = {
  name: string;
  email: string;
  accountType: AccountType;
};

/**
 * Dark-rail account navigation for buyers and other non-admin accounts.
 */
export const AccountNav = ({ name, email, accountType }: AccountNavProps) => {
  const t = useTranslations('Profile.nav');
  const tAuth = useTranslations('Auth');
  const pathname = usePathname();
  const router = useRouter();
  const logoutMutation = useLogoutMutation();
  const showBuyerTabs = accountType === 'buyer';

  const primaryItems = PRIMARY_NAV_ITEMS.filter((item) => !item.buyerOnly || showBuyerTabs);

  return (
    <nav aria-label={t('label')} className="flex h-full flex-col gap-1">
      <div className="mb-4 hidden md:block">
        <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-on-dark/65">
          {t('portalLabel')}
        </p>
        <AccountUserSummary name={name} email={email} accountType={accountType} />
      </div>

      <div className="mb-4 border-b border-on-dark/15 pb-4 md:hidden">
        <AccountUserSummary name={name} email={email} accountType={accountType} />
      </div>

      <div className="flex flex-1 flex-col gap-1">
        {primaryItems.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={navLinkClassName(active)}>
              <Icon className={NAV_ICON_CLASS} aria-hidden />
              {t(item.key)}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto flex flex-col gap-1 border-t border-on-dark/15 pt-3">
        <Link
          href={SETTINGS_NAV_ITEM.href}
          className={navLinkClassName(isActive(pathname, SETTINGS_NAV_ITEM.href))}
        >
          <Settings className={NAV_ICON_CLASS} aria-hidden />
          {t(SETTINGS_NAV_ITEM.key)}
        </Link>
        <button
          type="button"
          className={cn(
            navLinkClassName(false),
            'w-full text-left disabled:pointer-events-none disabled:opacity-50',
          )}
          disabled={logoutMutation.isPending}
          onClick={() => {
            void logoutMutation.mutateAsync().then(() => {
              router.push('/auth/login');
            });
          }}
        >
          <LogOut className={NAV_ICON_CLASS} aria-hidden />
          {logoutMutation.isPending ? tAuth('logout.submitting') : tAuth('logout.submit')}
        </button>
      </div>
    </nav>
  );
};
