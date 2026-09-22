'use client';

import type { MapLibreMap } from 'maplibre-gl';
import { useEffect } from 'react';

import { THREE_BUILDING_LAYER_ID } from '@/features/geo-map/three/constants';
import { ensureThreeBuildingLayer } from '@/features/geo-map/three/custom-building-layer';
import { syncRoadTraffic } from '@/features/geo-map/traffic/sync-road-traffic';

export type UseRoadTrafficLayerOptions = {
  map: MapLibreMap | null;
  isMapLoaded: boolean;
  /** When false, the traffic hook does not attach. */
  active: boolean;
  enabled: boolean;
};

/**
 * Road cars on the shared Three.js building layer (same on admin and public).
 * Syncs only on move/zoom end — animation is a matrix update inside render.
 */
export const useRoadTrafficLayer = ({
  map,
  isMapLoaded,
  active,
  enabled,
}: UseRoadTrafficLayerOptions): void => {
  useEffect(() => {
    if (!map || !isMapLoaded || !active) {
      return;
    }
    const refresh = (): void => {
      syncRoadTraffic(map, ensureThreeBuildingLayer(map), enabled);
    };
    refresh();
    map.on('moveend', refresh);
    map.on('zoomend', refresh);
    return () => {
      map.off('moveend', refresh);
      map.off('zoomend', refresh);
      if (map.getLayer(THREE_BUILDING_LAYER_ID)) {
        syncRoadTraffic(map, ensureThreeBuildingLayer(map), false);
      }
    };
  }, [map, isMapLoaded, active, enabled]);
};
