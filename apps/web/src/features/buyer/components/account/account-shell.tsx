import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { AccountMobileSectionTitle } from '@/features/buyer/components/account/account-mobile-section-title';
import { AccountNav } from '@/features/buyer/components/account/account-nav';
import { getMeOrNull } from '@/features/auth/api/auth-api';
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
  const user = await getMeOrNull(cookieHeader);

  if (!user) {
    redirect({
      href: '/auth/login?returnUrl=%2Fdashboard',
      locale,
    });
    return null;
  }

  if (user.accountType === 'platform_admin') {
    redirect({ href: '/admin/settings', locale });
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
      mobileHeader={<AccountMobileSectionTitle />}
      sidebar={<AccountNav accountType={user.accountType} />}
    >
      {children}
    </PortalShell>
  );
};
