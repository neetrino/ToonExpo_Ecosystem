import { setRequestLocale } from 'next-intl/server';

import { PortalReadinessClient } from './portal-readiness-client';

type PortalReadinessPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PortalReadinessPage({ params }: PortalReadinessPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PortalReadinessClient />;
}
