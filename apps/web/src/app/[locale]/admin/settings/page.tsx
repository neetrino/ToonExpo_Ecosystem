import { headers } from 'next/headers';
import { getLocale, setRequestLocale } from 'next-intl/server';

import { AdminSettingsPage } from '@/features/admin/components/admin-settings-page';
import { getMeOrNullCached as getMeOrNull } from '@/features/auth/api/get-me-or-null-cached';
import { redirect } from '@/i18n/navigation';

type AdminSettingsRouteProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Platform admin account settings route.
 */
export default async function AdminSettingsRoute({ params }: AdminSettingsRouteProps) {
  const { locale: urlLocale } = await params;
  const locale = await getLocale();
  setRequestLocale(locale);

  const headerStore = await headers();
  const cookieHeader = headerStore.get('cookie') ?? undefined;
  const user = await getMeOrNull(cookieHeader);

  if (!user) {
    redirect({ href: '/auth/login', locale: urlLocale });
    return null;
  }

  return <AdminSettingsPage user={user} />;
}
