import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getMeOrNullCached } from '@/features/auth/api/get-me-or-null-cached';
import { AccountMobileStack } from '@/features/buyer/components/account/account-mobile-stack';
import { AccountNav } from '@/features/buyer/components/account/account-nav';
import { redirect } from '@/i18n/navigation';
import { PortalShell } from '@/shared/ui/portal-shell';

type AccountShellProps = {
  children: ReactNode;
  locale: string;
};

/**
 * Authenticated buyer/visitor account chrome (rail sidebar + mobile drawer).
 */
export const AccountShell = async ({ children, locale }: AccountShellProps) => {
  setRequestLocale(locale);

  const headerStore = await headers();
  const cookieHeader = headerStore.get('cookie') ?? undefined;
  const user = await getMeOrNullCached(cookieHeader);

  if (!user) {
    redirect({
      href: '/auth/login?returnUrl=%2Fdashboard',
      locale,
    });
    return null;
  }

  if (user.accountType === 'platform_admin') {
    redirect({ href: '/admin', locale });
    return null;
  }

  const t = await getTranslations('Profile');

  return (
    <PortalShell
      brandHref="/dashboard"
      badge={t('badge')}
      userEmail={user.email}
      profileLabel={t('nav.dashboard')}
      navLabel={t('nav.label')}
      variant="rail"
      showRailHeaderMask={false}
      mobileDrawerControlledByNavbar
      className="bg-canvas"
      railHeader={
        <p className="truncate text-xs font-semibold uppercase tracking-[0.16em] text-on-dark/65">
          {t('nav.portalLabel')}
        </p>
      }
      sidebar={<AccountNav accountType={user.accountType} />}
    >
      <AccountMobileStack name={user.name} email={user.email} accountType={user.accountType}>
        {children}
      </AccountMobileStack>
    </PortalShell>
  );
};
