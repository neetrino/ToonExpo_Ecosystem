import { setRequestLocale } from 'next-intl/server';

import { AdminCityMapPage } from '@/features/city-map/components/admin-city-map-page';

type PageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Platform admin city 3D map placements editor.
 */
export default async function AdminCityMapRoutePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AdminCityMapPage />;
}
