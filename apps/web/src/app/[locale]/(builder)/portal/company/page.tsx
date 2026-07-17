import { setRequestLocale } from 'next-intl/server';

import { PortalCompanyClient } from './portal-company-client';

type PortalCompanyPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PortalCompanyPage({ params }: PortalCompanyPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PortalCompanyClient />;
}
