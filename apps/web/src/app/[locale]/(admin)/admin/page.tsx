import { setRequestLocale } from 'next-intl/server';

import { AdminHomeClient } from './admin-home-client';

type AdminPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminPage({ params }: AdminPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AdminHomeClient />;
}
