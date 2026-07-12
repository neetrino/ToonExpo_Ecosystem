import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { PublicVenueMapView } from '@/components/exhibition/public-venue-map';
import { loadPublicVenueMap } from '@/lib/exhibition/venue-queries';

type ExhibitionPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ExhibitionPage({ params }: ExhibitionPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, venueMap] = await Promise.all([
    getTranslations('catalog.exhibition'),
    loadPublicVenueMap(),
  ]);

  if (!venueMap) {
    notFound();
  }

  return (
    <section className="catalog-page">
      <header className="catalog-page__header">
        <h1 className="catalog-page__title">{t('title')}</h1>
        <p className="catalog-page__subtitle">{t('subtitle', { event: venueMap.event.name })}</p>
      </header>
      <PublicVenueMapView venueMap={venueMap} />
    </section>
  );
}
