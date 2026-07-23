import { headers } from 'next/headers';
import { setRequestLocale } from 'next-intl/server';

import { getMeOrNull } from '@/features/auth/api/auth-api';
import { AccountSettingsView } from '@/features/buyer/components/account/account-settings-view';
import { redirect } from '@/i18n/navigation';

type PartnerSettingsPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Partner portal account settings (profile + password).
 */
export default async function PartnerSettingsPage({ params }: PartnerSettingsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const headerStore = await headers();
  const cookieHeader = headerStore.get('cookie') ?? undefined;
  const user = await getMeOrNull(cookieHeader);

  if (!user) {
    redirect({ href: '/auth/login?returnUrl=%2Fpartner%2Fsettings', locale });
    return null;
  }

  return (
    <AccountSettingsView
      user={user}
      titleNamespace="Partner.settings"
      passwordHeadingId="partner-password-heading"
    />
  );
}
