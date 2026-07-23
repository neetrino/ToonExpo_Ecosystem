'use client';

import type { PublicEntranceNode } from '@toonexpo/contracts';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import { getPublicBooth } from '@/features/exhibition/api/public-exhibition-api';

import {
  ExpoBoothList,
  ExpoSearchResults,
} from '@/features/exhibition/components/public/expo-search-results';
import { ExpoBoothSheet } from '@/features/exhibition/components/public/expo-booth-sheet';
import { ExpoMapView } from '@/features/exhibition/components/public/expo-map-view';
import { EXPO_SEARCH_DEBOUNCE_MS } from '@/features/exhibition/constants';
import {
  usePublicCurrentEventQuery,
  usePublicVenueMapBoothsQuery,
  usePublicVenueMapEntranceNodesQuery,
  usePublicVenueMapRouteQuery,
  usePublicVenueMapSearchQuery,
} from '@/features/exhibition/hooks/use-exhibition';
import { formatEventDateRange } from '@/features/exhibition/utils/format-event-dates';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';

const resolveEntranceLabel = (node: PublicEntranceNode): string =>
  node.label ?? node.code ?? node.id.slice(0, 8);

/**
 * Public mobile-first expo venue map page content.
 */
export const ExpoMapPage = () => {
  const t = useTranslations('Expo');
  const locale = useLocale();
  const eventQuery = usePublicCurrentEventQuery();
  const [search, setSearch] = useState('');
  const [selectedMapIndex, setSelectedMapIndex] = useState(0);
  const [selectedBoothId, setSelectedBoothId] = useState<string | null>(null);
  const [routeRequested, setRouteRequested] = useState(false);
  const [fromNodeId, setFromNodeId] = useState<string | null>(null);
  const [showEntrancePicker, setShowEntrancePicker] = useState(false);
  const debouncedSearch = useDebouncedValue(search, EXPO_SEARCH_DEBOUNCE_MS);

  const event = eventQuery.data ?? null;
  const venueMap = event?.venueMaps[selectedMapIndex] ?? event?.venueMaps[0] ?? null;
  const boothsQuery = usePublicVenueMapBoothsQuery(venueMap?.id ?? '');
  const searchQuery = usePublicVenueMapSearchQuery(venueMap?.id ?? '', debouncedSearch);
  const entranceNodesQuery = usePublicVenueMapEntranceNodesQuery(venueMap?.id ?? '');

  const booths = boothsQuery.data?.data ?? [];
  const selectedBooth = booths.find((booth) => booth.id === selectedBoothId) ?? null;
  const entranceNodes = entranceNodesQuery.data?.data ?? [];

  const routeQuery = usePublicVenueMapRouteQuery(
    venueMap?.id ?? '',
    fromNodeId,
    selectedBoothId,
    routeRequested,
  );

  const dates = event ? formatEventDateRange(event.startDate, event.endDate, locale) : null;

  const routeNodes = useMemo(() => {
    if (!routeRequested || !routeQuery.data?.routeAvailable) {
      return [];
    }
    return routeQuery.data.nodes;
  }, [routeQuery.data, routeRequested]);

  const routeAvailable = entranceNodes.length > 0;

  useEffect(() => {
    if (!selectedBoothId) {
      return;
    }

    void getPublicBooth(selectedBoothId, locale).catch(() => undefined);
  }, [locale, selectedBoothId]);

  const resetRoute = () => {
    setRouteRequested(false);
    setFromNodeId(null);
    setShowEntrancePicker(false);
  };

  const startRoute = (entranceId: string) => {
    setFromNodeId(entranceId);
    setRouteRequested(true);
    setShowEntrancePicker(false);
  };

  const onRouteRequest = () => {
    if (entranceNodes.length === 0) {
      setRouteRequested(true);
      setFromNodeId(null);
      setShowEntrancePicker(false);
      return;
    }

    if (entranceNodes.length === 1) {
      startRoute(entranceNodes[0]?.id ?? '');
      return;
    }

    setShowEntrancePicker(true);
  };

  if (eventQuery.isLoading) {
    return <p className="text-sm text-ink-secondary">{t('loading')}</p>;
  }

  if (eventQuery.isError) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t('error')}
      </p>
    );
  }

  if (!event || !venueMap) {
    return (
      <Card className="px-4 py-10 text-center">
        <h1 className="text-lg font-semibold text-ink">{t('noEvent.title')}</h1>
        <p className="mt-2 text-sm text-ink-secondary">{t('noEvent.message')}</p>
      </Card>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-content flex-col gap-4 px-6 py-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-page-title text-ink">{event.name}</h1>
        {dates ? <p className="text-sm text-ink-secondary">{dates}</p> : null}
      </div>

      {event.venueMaps.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {event.venueMaps.map((map, index) => (
            <Button
              key={map.id}
              type="button"
              size="sm"
              variant={selectedMapIndex === index ? 'secondary' : 'ghost'}
              onClick={() => {
                setSelectedMapIndex(index);
                setSelectedBoothId(null);
                resetRoute();
              }}
            >
              {map.title}
            </Button>
          ))}
        </div>
      ) : null}

      <Input
        value={search}
        placeholder={t('search.placeholder')}
        onChange={(event) => setSearch(event.target.value)}
        aria-label={t('search.label')}
      />

      <ExpoSearchResults
        results={searchQuery.data?.data ?? []}
        highlightedBoothId={selectedBoothId}
        onSelect={(boothId) => {
          setSelectedBoothId(boothId);
          resetRoute();
        }}
      />

      <ExpoMapView
        mediaAssetId={venueMap.mediaAssetId}
        mediaFileUrl={venueMap.mediaUrl}
        booths={booths}
        highlightedBoothId={selectedBoothId}
        routeNodes={routeNodes}
        routeAvailable={routeQuery.data?.routeAvailable ?? false}
        onSelectBooth={(boothId) => {
          setSelectedBoothId(boothId);
          resetRoute();
        }}
      />

      {showEntrancePicker ? (
        <Card className="flex flex-col gap-3 px-4 py-4">
          <div>
            <h2 className="text-sm font-semibold text-ink">{t('route.pickEntrance')}</h2>
            <p className="mt-1 text-xs text-ink-muted">{t('route.pickEntranceHint')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {entranceNodes.map((node) => (
              <Button
                key={node.id}
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => startRoute(node.id)}
              >
                {t('route.entranceOption', { label: resolveEntranceLabel(node) })}
              </Button>
            ))}
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={resetRoute}>
            {t('route.cancel')}
          </Button>
        </Card>
      ) : null}

      {routeRequested && !routeAvailable ? (
        <p className="text-sm text-ink-secondary">{t('route.noEntranceNodes')}</p>
      ) : null}

      {routeRequested && routeAvailable && routeQuery.data && !routeQuery.data.routeAvailable ? (
        <p className="text-sm text-ink-secondary">{t('route.unavailable')}</p>
      ) : null}

      {selectedBooth ? (
        <ExpoBoothSheet
          booth={selectedBooth}
          routeAvailable={routeAvailable}
          onRoute={onRouteRequest}
          onClose={() => {
            setSelectedBoothId(null);
            resetRoute();
          }}
        />
      ) : null}

      <ExpoBoothList
        booths={booths}
        highlightedBoothId={selectedBoothId}
        onSelect={(boothId) => {
          setSelectedBoothId(boothId);
          resetRoute();
        }}
      />

      {routeRequested ? (
        <Button type="button" variant="ghost" size="sm" onClick={resetRoute}>
          {t('route.reset')}
        </Button>
      ) : null}
    </div>
  );
};
