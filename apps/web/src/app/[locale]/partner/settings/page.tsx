import { headers } from 'next/headers';
import { getLocale, setRequestLocale } from 'next-intl/server';

import { getMeOrNullCached as getMeOrNull } from '@/features/auth/api/get-me-or-null-cached';
import { AccountSettingsView } from '@/features/buyer/components/account/account-settings-view';
import { redirect } from '@/i18n/navigation';

type PartnerSettingsPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Partner portal account settings (profile + password).
 */
export default async function PartnerSettingsPage({ params }: PartnerSettingsPageProps) {
  const { locale: urlLocale } = await params;
  const locale = await getLocale();
  setRequestLocale(locale);

  const headerStore = await headers();
  const cookieHeader = headerStore.get('cookie') ?? undefined;
  const user = await getMeOrNull(cookieHeader);

  if (!user) {
    redirect({ href: '/auth/login?returnUrl=%2Fpartner%2Fsettings', locale: urlLocale });
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
