import { headers } from 'next/headers';
import { setRequestLocale } from 'next-intl/server';

import { AdminSettingsPage } from '@/features/admin/components/admin-settings-page';
import { getMeSessionCached } from '@/features/auth/api/get-me-or-null-cached';
import { redirect } from '@/i18n/navigation';
import { ApiUnavailablePanel } from '@/shared/ui/api-unavailable-panel';

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
  const session = await getMeSessionCached(cookieHeader);
  if (session.status === 'unavailable') {
    return <ApiUnavailablePanel />;
  }
  const { user } = session;

  if (!user) {
    redirect({ href: '/auth/login', locale });
    return null;
  }

  return <AdminSettingsPage user={user} />;
}
