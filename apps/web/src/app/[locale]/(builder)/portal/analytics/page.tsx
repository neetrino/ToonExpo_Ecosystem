import { setRequestLocale } from 'next-intl/server';

import { PortalAnalyticsClient } from './portal-analytics-client';

type PortalAnalyticsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PortalAnalyticsPage({ params }: PortalAnalyticsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PortalAnalyticsClient />;
}
