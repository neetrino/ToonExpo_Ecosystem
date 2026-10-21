'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

import { usePublicVenueMapSnapshotQuery } from '@/features/exhibition/hooks/use-public-venue-map';

const ExpoVenueMapView = dynamic(
  () =>
    import('@/features/exhibition/components/public/venue-map-3d/expo-venue-map').then(
      (mod) => mod.ExpoVenueMapView,
    ),
  { ssr: false },
);

/**
 * Loads the published BOS snapshot, then mounts the 3D map in the browser.
 */
export const ExpoVenueMap = () => {
  const t = useTranslations('Expo');
  const snapshotQuery = usePublicVenueMapSnapshotQuery();
  const snapshot = snapshotQuery.data ?? null;

  if (snapshotQuery.isLoading) {
    return <p className="px-6 pt-28 text-sm text-ink-secondary">{t('loading')}</p>;
  }

  if (snapshotQuery.isError) {
    return (
      <p role="alert" className="px-6 pt-28 text-sm text-danger">
        {t('error')}
      </p>
    );
  }

  if (!snapshot) {
    return (
      <div className="px-6 pt-28 text-center">
        <h1 className="text-lg font-semibold text-ink">{t('noEvent.title')}</h1>
        <p className="mt-2 text-sm text-ink-secondary">{t('noEvent.message')}</p>
      </div>
    );
  }

  return <ExpoVenueMapView snapshot={snapshot} />;
};
