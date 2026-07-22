import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { AccountMobileSectionTitle } from '@/features/buyer/components/account/account-mobile-section-title';
import { AccountNav } from '@/features/buyer/components/account/account-nav';
import { getMeOrNull } from '@/features/auth/api/auth-api';
import { redirect } from '@/i18n/navigation';
import { PortalShell } from '@/shared/ui/portal-shell';

type SettingsLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Authenticated account shell with rail sidebar and mobile drawer.
 */
export default async function SettingsLayout({ children, params }: SettingsLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const headerStore = await headers();
  const cookieHeader = headerStore.get('cookie') ?? undefined;
  const user = await getMeOrNull(cookieHeader);

  if (!user) {
    redirect({
      href: '/auth/login?returnUrl=%2Fsettings',
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
      brandHref="/settings"
      badge={t('badge')}
      userEmail={user.email}
      profileLabel={t('nav.overview')}
      navLabel={t('nav.label')}
      variant="rail"
      mobileHeader={<AccountMobileSectionTitle />}
      sidebar={<AccountNav name={user.name} email={user.email} accountType={user.accountType} />}
    >
      {children}
    </PortalShell>
  );
}
