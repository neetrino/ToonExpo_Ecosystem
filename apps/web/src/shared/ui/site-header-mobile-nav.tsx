'use client';

import { useTranslations } from 'next-intl';

import type { UserResponse } from '@toonexpo/contracts';

import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type NavHref = '/apartments' | '/developments' | '/partners' | '/mortgage';

type SiteHeaderMobileNavProps = {
  navItems: ReadonlyArray<{
    href: NavHref;
    key: 'buy' | 'newDevelopments' | 'marketInsights' | 'mortgage';
  }>;
  pathname: string;
  user: UserResponse | undefined;
  settingsHref: '/admin/settings' | '/settings';
  listPropertyHref: '/builder' | '/auth/register';
  logoutPending: boolean;
  onClose: () => void;
  onLogout: () => void;
  isNavActive: (pathname: string, href: NavHref) => boolean;
};

/**
 * Collapsible public header drawer for viewports below `lg`.
 */
export const SiteHeaderMobileNav = ({
  navItems,
  pathname,
  user,
  settingsHref,
  listPropertyHref,
  logoutPending,
  onClose,
  onLogout,
  isNavActive,
}: SiteHeaderMobileNavProps) => {
  const t = useTranslations('Nav');
  const tAuth = useTranslations('Auth');

  return (
    <div
      id="mobile-nav"
      className={cn(
        'relative z-10 mt-1 rounded-[1.25rem] border border-header-border',
        'bg-surface-elevated px-1 py-3 text-ink shadow-md lg:hidden',
      )}
    >
      <nav className="flex flex-col gap-1 text-sm" aria-label={t('main')}>
        {navItems.map((item) => {
          const active = isNavActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-sm px-3 py-3 font-medium transition-colors',
                active ? 'bg-brand-soft text-brand-deep' : 'text-ink hover:bg-surface',
              )}
              onClick={onClose}
            >
              {t(item.key)}
            </Link>
          );
        })}
        {!user ? (
          <>
            <Link
              href="/auth/login"
              className="rounded-sm px-3 py-3 font-medium text-ink hover:bg-surface"
              onClick={onClose}
            >
              {t('login')}
            </Link>
            <Link
              href="/auth/register"
              className="rounded-sm px-3 py-3 font-medium text-brand-deep hover:bg-brand-soft"
              onClick={onClose}
            >
              {t('listProperty')}
            </Link>
          </>
        ) : (
          <>
            {user.accountType === 'platform_admin' ? (
              <Link
                href="/admin"
                className="rounded-sm px-3 py-3 font-medium text-ink hover:bg-surface"
                onClick={onClose}
              >
                {t('admin')}
              </Link>
            ) : (
              <Link
                href={settingsHref}
                className="rounded-sm px-3 py-3 font-medium text-ink hover:bg-surface"
                onClick={onClose}
              >
                {t('profile')}
              </Link>
            )}
            <Link
              href={listPropertyHref}
              className="rounded-sm px-3 py-3 font-medium text-brand-deep hover:bg-brand-soft"
              onClick={onClose}
            >
              {t('listProperty')}
            </Link>
            <button
              type="button"
              className="rounded-sm px-3 py-3 text-left font-medium text-danger hover:bg-danger-soft disabled:opacity-50"
              disabled={logoutPending}
              onClick={onLogout}
            >
              {logoutPending ? tAuth('logout.submitting') : tAuth('logout.submit')}
            </button>
          </>
        )}
      </nav>
    </div>
  );
};
