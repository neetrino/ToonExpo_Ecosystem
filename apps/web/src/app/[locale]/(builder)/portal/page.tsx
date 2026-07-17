import { setRequestLocale } from 'next-intl/server';

import { PortalOverviewClient } from './portal-overview-client';

type PortalOverviewPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PortalOverviewPage({ params }: PortalOverviewPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PortalOverviewClient />;
}
