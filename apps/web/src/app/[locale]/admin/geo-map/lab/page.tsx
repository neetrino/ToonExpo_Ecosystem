import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { GeoMapLabPage } from '@/features/geo-map/lab/geo-map-lab-page';

type PageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Temporary `GeoMapCanvas` sandbox for headed QA (Stage 2a).
 */
export default async function AdminGeoMapLabPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<p className="text-sm text-ink-secondary">…</p>}>
      <GeoMapLabPage />
    </Suspense>
  );
}
