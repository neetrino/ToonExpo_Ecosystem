import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { SiteFooter } from '@/features/catalog/components/site-footer';
import { MarketInsightsPageContent } from '@/features/insights/components/market-insights-page-content';

type InsightsPageProps = {
  params: Promise<{ locale: string }>;
};

export const generateMetadata = async ({ params }: InsightsPageProps): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'MarketInsights' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
};

/**
 * Public market insights — pulse dashboard + cities table (Lovable `insights`).
 */
export default async function InsightsPage({ params }: InsightsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-canvas">
      <main>
        <MarketInsightsPageContent />
      </main>
      <SiteFooter />
    </div>
  );
}
