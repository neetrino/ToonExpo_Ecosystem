import { headers } from 'next/headers';
import { setRequestLocale } from 'next-intl/server';

import { getMeSessionCached } from '@/features/auth/api/get-me-or-null-cached';
import { AccountSettingsView } from '@/features/buyer/components/account/account-settings-view';
import { redirect } from '@/i18n/navigation';
import { ApiUnavailablePanel } from '@/shared/ui/api-unavailable-panel';

type BuilderSettingsPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Builder portal account settings (profile + password).
 */
export default async function BuilderSettingsPage({ params }: BuilderSettingsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const headerStore = await headers();
  const cookieHeader = headerStore.get('cookie') ?? undefined;
  const session = await getMeSessionCached(cookieHeader);
  if (session.status === 'unavailable') {
    return <ApiUnavailablePanel />;
  }
  const { user } = session;

  if (!user) {
    redirect({ href: '/auth/login?returnUrl=%2Fbuilder%2Fsettings', locale });
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
