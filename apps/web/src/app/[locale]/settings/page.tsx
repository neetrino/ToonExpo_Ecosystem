import { headers } from 'next/headers';
import { setRequestLocale } from 'next-intl/server';

import { getMeOrNull } from '@/features/auth/api/auth-api';
import { getAccountSettingsHref } from '@/features/auth/utils/get-account-settings-href';
import { AccountSettingsView } from '@/features/buyer/components/account/account-settings-view';
import { redirect } from '@/i18n/navigation';

type AccountSettingsPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Account settings for buyer / entrance staff.
 * Company members and admins are sent to their portal settings routes.
 */
export default async function AccountSettingsPage({ params }: AccountSettingsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const headerStore = await headers();
  const cookieHeader = headerStore.get('cookie') ?? undefined;
  const user = await getMeOrNull(cookieHeader);

  if (!user) {
    redirect({ href: '/auth/login?returnUrl=%2Fsettings', locale });
    return null;
  }

  const settingsHref = getAccountSettingsHref(user);
  if (settingsHref !== '/settings') {
    redirect({ href: settingsHref, locale });
    return null;
  }

  return <AccountSettingsView user={user} titleNamespace="Profile.settings" />;
}
