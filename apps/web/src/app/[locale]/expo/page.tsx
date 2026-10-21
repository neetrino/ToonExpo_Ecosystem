import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { ExpoVenueMap } from '@/features/exhibition/components/public/venue-map-3d/expo-venue-map-gate';

type ExpoPageProps = {
  params: Promise<{ locale: string }>;
};

export const generateMetadata = async ({ params }: ExpoPageProps): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Expo' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
};

export default async function ExpoRoutePage({ params }: ExpoPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ExpoVenueMap />;
}
