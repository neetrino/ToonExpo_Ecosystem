import { setRequestLocale } from 'next-intl/server';

import { AdminCompaniesClient } from './admin-companies-client';

type AdminCompaniesPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminCompaniesPage({ params }: AdminCompaniesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AdminCompaniesClient />;
}
