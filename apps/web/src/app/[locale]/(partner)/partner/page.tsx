import { setRequestLocale } from 'next-intl/server';

import { PartnerOverviewClient } from './partner-overview-client';

type PartnerOverviewPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PartnerOverviewPage({ params }: PartnerOverviewPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PartnerOverviewClient />;
}
