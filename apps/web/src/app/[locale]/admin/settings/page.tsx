import { headers } from 'next/headers';
import { setRequestLocale } from 'next-intl/server';

import { AdminSettingsPage } from '@/features/admin/components/admin-settings-page';
import { getMeOrNull } from '@/features/auth/api/auth-api';
import { redirect } from '@/i18n/navigation';

type AdminSettingsRouteProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Platform admin account settings route.
 */
export default async function AdminSettingsRoute({ params }: AdminSettingsRouteProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const headerStore = await headers();
  const cookieHeader = headerStore.get('cookie') ?? undefined;
  const user = await getMeOrNull(cookieHeader);

  if (!user) {
    redirect({ href: '/auth/login', locale });
    return null;
  }

  return <AdminSettingsPage user={user} />;
}
