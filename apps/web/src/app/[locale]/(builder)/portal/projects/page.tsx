import { setRequestLocale } from 'next-intl/server';

import { PortalProjectsClient } from './portal-projects-client';

type PortalProjectsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PortalProjectsPage({ params }: PortalProjectsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PortalProjectsClient />;
}
