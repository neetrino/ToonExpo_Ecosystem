import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { GeoMapAdminPage } from '@/features/geo-map/admin';

type PageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Platform admin 3D map editor — place / transform / publish project GLB models.
 */
export default async function AdminGeoMapPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<p className="p-6 text-sm text-ink-secondary">…</p>}>
      <GeoMapAdminPage />
    </Suspense>
  );
}
