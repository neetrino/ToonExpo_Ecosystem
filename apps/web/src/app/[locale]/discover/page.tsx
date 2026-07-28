import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { DiscoverPageContent } from '@/features/discover/components/discover-page-content';
import { SiteFooter } from '@/features/catalog/components/site-footer';

type DiscoverPageProps = {
  params: Promise<{ locale: string }>;
};

export const generateMetadata = async ({ params }: DiscoverPageProps): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Discover' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
};

/**
 * Buyer discover / swipe surface for projects (bottom-nav heart tab).
 */
export default async function DiscoverPage({ params }: DiscoverPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-canvas">
      <DiscoverPageContent />
      <SiteFooter />
    </div>
  );
}
