'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { ExpoAreaList } from '@/features/exhibition/components/public/expo-area-list';
import { ExpoAreaSheet } from '@/features/exhibition/components/public/expo-area-sheet';
import { ExpoSnapshotMapView } from '@/features/exhibition/components/public/expo-snapshot-map-view';
import { EXPO_SEARCH_DEBOUNCE_MS } from '@/features/exhibition/constants';
import { usePublicVenueMapSnapshotQuery } from '@/features/exhibition/hooks/use-public-venue-map';
import { matchesVenueMapSearch } from '@/features/exhibition/utils/matches-venue-map-search';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { Card } from '@/shared/ui/card';

/**
 * Public venue map page — renders the active BOS snapshot.
 */
export const ExpoMapPage = () => {
  const t = useTranslations('Expo');
  const snapshotQuery = usePublicVenueMapSnapshotQuery();
  const [search, setSearch] = useState('');
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search, EXPO_SEARCH_DEBOUNCE_MS);

  const snapshot = snapshotQuery.data ?? null;
  const visibleAreas = useMemo(() => {
    if (!snapshot) {
      return [];
    }
    return snapshot.areas.filter((area) => matchesVenueMapSearch(area, debouncedSearch));
  }, [debouncedSearch, snapshot]);

  const selectedArea = snapshot?.areas.find((area) => area.id === selectedAreaId) ?? null;

  if (snapshotQuery.isLoading) {
    return <p className="text-sm text-ink-secondary">{t('loading')}</p>;
  }

  if (snapshotQuery.isError) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t('error')}
      </p>
    );
  }

  if (!snapshot) {
    return (
      <Card className="px-4 py-10 text-center">
        <h1 className="text-lg font-semibold text-ink">{t('noEvent.title')}</h1>
        <p className="mt-2 text-sm text-ink-secondary">{t('noEvent.message')}</p>
      </Card>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-content flex-col gap-4 px-6 pt-12 pb-6 sm:pt-16">
      <div className="flex flex-col gap-1">
        <h1 className="text-page-title text-ink">{snapshot.title}</h1>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <ExpoSnapshotMapView
            snapshot={{ ...snapshot, areas: visibleAreas }}
            highlightedAreaId={selectedAreaId}
            onSelectArea={setSelectedAreaId}
          />
          {selectedArea ? (
            <div className="mt-4">
              <ExpoAreaSheet area={selectedArea} onClose={() => setSelectedAreaId(null)} />
            </div>
          ) : null}
        </div>

        <div className="w-full shrink-0 lg:sticky lg:top-24 lg:w-80 lg:self-start">
          <ExpoAreaList
            areas={visibleAreas}
            highlightedAreaId={selectedAreaId}
            search={search}
            onSearchChange={setSearch}
            onSelect={setSelectedAreaId}
          />
        </div>
      </div>
    </div>
  );
};
