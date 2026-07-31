import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { PublicGeoMapPage } from '@/features/geo-map/public';

type GeoMapRoutePageProps = {
  params: Promise<{ locale: string }>;
};

export const generateMetadata = async ({ params }: GeoMapRoutePageProps): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'GeoMap' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
};

export default async function GeoMapRoutePage({ params }: GeoMapRoutePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <PublicGeoMapPage />;
}
