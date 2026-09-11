'use client';

import type { MapLibreMap } from 'maplibre-gl';
import { useEffect } from 'react';

import { mapStyleIsReady } from '@/features/geo-map/utils/map-style-is-ready';
import {
  removeRoundedOsmBuildings,
  syncRoundedOsmBuildings,
} from '@/features/geo-map/utils/sync-rounded-osm-buildings';

/**
 * Smooths faceted OSM circles in the current window.
 * Syncs on move/zoom end — never on `idle`, and never hides `building-3d`.
 */
export const useRoundedOsmBuildings = (map: MapLibreMap | null, isMapLoaded: boolean): void => {
  useEffect(() => {
    if (!map || !isMapLoaded) {
      return;
    }
    const refresh = (): void => {
      if (mapStyleIsReady(map)) {
        syncRoundedOsmBuildings(map);
      }
    };
    refresh();
    map.on('moveend', refresh);
    map.on('zoomend', refresh);
    map.on('style.load', refresh);
    return () => {
      map.off('moveend', refresh);
      map.off('zoomend', refresh);
      map.off('style.load', refresh);
      if (mapStyleIsReady(map)) {
        removeRoundedOsmBuildings(map);
      }
    };
  }, [map, isMapLoaded]);
};
