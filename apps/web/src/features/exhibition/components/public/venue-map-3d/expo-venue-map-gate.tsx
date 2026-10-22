'use client';

import { useTranslations } from 'next-intl';

import { ExpoVenueMapView } from '@/features/exhibition/components/public/venue-map-3d/expo-venue-map';
import { usePublicVenueMapSnapshotQuery } from '@/features/exhibition/hooks/use-public-venue-map';

/**
 * Loads the published BOS snapshot onto the same hall as the BOS venue map.
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
