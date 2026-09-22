import { headers } from 'next/headers';
import { getLocale, setRequestLocale } from 'next-intl/server';

import { getMeOrNullCached as getMeOrNull } from '@/features/auth/api/get-me-or-null-cached';
import { AccountSettingsView } from '@/features/buyer/components/account/account-settings-view';
import { redirect } from '@/i18n/navigation';

type BuilderSettingsPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Builder portal account settings (profile + password).
 */
export default async function BuilderSettingsPage({ params }: BuilderSettingsPageProps) {
  const { locale: urlLocale } = await params;
  const locale = await getLocale();
  setRequestLocale(locale);

  const headerStore = await headers();
  const cookieHeader = headerStore.get('cookie') ?? undefined;
  const user = await getMeOrNull(cookieHeader);

  if (!user) {
    redirect({ href: '/auth/login?returnUrl=%2Fbuilder%2Fsettings', locale: urlLocale });
    return null;
  }

  return (
    <AccountSettingsView
      user={user}
      titleNamespace="Builder.settings"
      passwordHeadingId="builder-password-heading"
    />
  );
}
