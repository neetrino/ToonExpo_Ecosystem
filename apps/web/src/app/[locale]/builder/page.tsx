import { getLocale, setRequestLocale } from 'next-intl/server';

import { BuilderDashboardPage } from '@/features/builder/components/builder-dashboard-page';

type BuilderIndexPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Builder portal dashboard.
 */
export default async function BuilderIndexPage({ params }: BuilderIndexPageProps) {
  await params;
  const locale = await getLocale();
  setRequestLocale(locale);

  return <BuilderDashboardPage />;
}
