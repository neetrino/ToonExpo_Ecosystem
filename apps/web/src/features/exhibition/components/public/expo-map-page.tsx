'use client';

import type { PublicVenueMapSnapshotResponse } from '@toonexpo/contracts';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { ExpoAreaSheet } from '@/features/exhibition/components/public/expo-area-sheet';
import { ExpoMapSearch } from '@/features/exhibition/components/public/expo-map-search';
import { ExpoSnapshotMapView } from '@/features/exhibition/components/public/expo-snapshot-map-view';
import {
  EXPO_SEARCH_DEBOUNCE_MS,
  EXPO_SEARCH_MAX_RESULTS,
} from '@/features/exhibition/constants';
import { usePublicVenueMapSnapshotQuery } from '@/features/exhibition/hooks/use-public-venue-map';
import { matchesVenueMapSearch } from '@/features/exhibition/utils/matches-venue-map-search';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { Card } from '@/shared/ui/card';

type ExpoMapLoadedViewProps = {
  snapshot: PublicVenueMapSnapshotResponse;
};

const ExpoMapLoadedView = ({ snapshot }: ExpoMapLoadedViewProps) => {
  const [search, setSearch] = useState('');
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search, EXPO_SEARCH_DEBOUNCE_MS);
  const selectedArea = snapshot.areas.find((area) => area.id === selectedAreaId) ?? null;
  const searchResults = useMemo(() => {
    if (debouncedSearch.trim().length === 0) {
      return [];
    }
    return snapshot.areas
      .filter((area) => matchesVenueMapSearch(area, debouncedSearch))
      .slice(0, EXPO_SEARCH_MAX_RESULTS);
  }, [debouncedSearch, snapshot.areas]);

  const onSelectArea = (areaId: string) => {
    setSelectedAreaId(areaId);
    setSearch('');
  };

  return (
    <div className="mx-auto flex w-full max-w-content flex-col gap-4 px-6 pt-12 pb-6 sm:pt-16">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="min-w-0 text-page-title text-ink">{snapshot.title}</h1>
        <ExpoMapSearch
          search={search}
          results={searchResults}
          onSearchChange={setSearch}
          onSelect={onSelectArea}
        />
      </div>
      <ExpoSnapshotMapView
        snapshot={snapshot}
        highlightedAreaId={selectedAreaId}
        onSelectArea={onSelectArea}
      />
      {selectedArea ? (
        <ExpoAreaSheet area={selectedArea} onClose={() => setSelectedAreaId(null)} />
      ) : null}
    </div>
  );
};

/**
 * Public venue map page — renders the active BOS snapshot.
 */
export const ExpoMapPage = () => {
  const t = useTranslations('Expo');
  const snapshotQuery = usePublicVenueMapSnapshotQuery();
  const snapshot = snapshotQuery.data ?? null;

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

  return <ExpoMapLoadedView snapshot={snapshot} />;
};
