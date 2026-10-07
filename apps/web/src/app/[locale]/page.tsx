import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { HomeCatalogBands } from '@/features/catalog/components/home-catalog-bands';
import { HomeHero } from '@/features/catalog/components/home-hero';
import { HomeMapSection } from '@/features/catalog/components/home-map-section';
import { HomeMortgage } from '@/features/catalog/components/home-mortgage';
import {
  HomeCatalogBandsFallback,
  HomeHeroFallback,
} from '@/features/catalog/components/home-page-fallbacks';
import { HomeStats } from '@/features/catalog/components/home-stats';
import { SiteFooter } from '@/features/catalog/components/site-footer';

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export const generateMetadata = async ({ params }: HomePageProps): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'HomePage' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
};

/**
 * Public home. Hero and featured bands suspend independently so the first
 * byte is not blocked on the slowest catalog query. Fetches soft-fail inside
 * those sections when the Nest API is unreachable.
 */
export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-canvas">
      <Suspense fallback={<HomeHeroFallback />}>
        <HomeHero />
      </Suspense>
      <HomeStats />
      <Suspense fallback={<HomeCatalogBandsFallback />}>
        <HomeCatalogBands locale={locale} />
      </Suspense>
      <HomeMapSection />
      <HomeMortgage />
      <SiteFooter />
    </div>
  );
}
