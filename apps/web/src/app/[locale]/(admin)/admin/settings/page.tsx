import { setRequestLocale } from 'next-intl/server';

import { AdminSettingsClient } from './admin-settings-client';

type AdminSettingsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminSettingsPage({ params }: AdminSettingsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AdminSettingsClient />;
}
