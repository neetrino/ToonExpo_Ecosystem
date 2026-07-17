import { setRequestLocale } from 'next-intl/server';

import { AdminIntegrationsClient } from './admin-integrations-client';

type AdminIntegrationsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminIntegrationsPage({ params }: AdminIntegrationsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AdminIntegrationsClient />;
}
