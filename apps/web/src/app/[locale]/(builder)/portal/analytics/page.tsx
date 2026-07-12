import { getTranslations, setRequestLocale } from 'next-intl/server';

import { BuilderAnalyticsView } from '@/components/analytics/builder-analytics-view';
import { loadBuilderAnalytics } from '@/lib/analytics/builder-queries';
import { assertBuilderSession } from '@/lib/builder/assert-builder-session';

type PortalAnalyticsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PortalAnalyticsPage({ params }: PortalAnalyticsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const builderContext = await assertBuilderSession();
  if (!builderContext) {
    return null;
  }

  const [t, data] = await Promise.all([
    getTranslations('portal.analytics'),
    loadBuilderAnalytics(builderContext.companyId),
  ]);

  return <BuilderAnalyticsView t={t} data={data} />;
}
