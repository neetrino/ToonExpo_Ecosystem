'use client';

import type { MapLibreMap } from 'maplibre-gl';
import { useEffect } from 'react';

import { THREE_BUILDING_LAYER_ID } from '@/features/geo-map/three/constants';
import { ensureThreeBuildingLayer } from '@/features/geo-map/three/custom-building-layer';
import { syncGreenCanopy } from '@/features/geo-map/trees/sync-green-canopy';

export type UseGreenCanopyLayerOptions = {
  map: MapLibreMap | null;
  isMapLoaded: boolean;
  /** When false, the canopy hook does not attach. */
  active: boolean;
  enabled: boolean;
};

/**
 * Park canopy on the shared Three.js building layer (same on admin and public).
 * Syncs only on move/zoom end — never on `idle`, which would loop with repaint.
 */
export const useGreenCanopyLayer = ({
  map,
  isMapLoaded,
  active,
  enabled,
}: UseGreenCanopyLayerOptions): void => {
  useEffect(() => {
    if (!map || !isMapLoaded || !active) {
      return;
    }
    const refresh = (): void => {
      syncGreenCanopy(map, ensureThreeBuildingLayer(map), enabled);
    };
    refresh();
    map.on('moveend', refresh);
    map.on('zoomend', refresh);
    return () => {
      map.off('moveend', refresh);
      map.off('zoomend', refresh);
      if (map.getLayer(THREE_BUILDING_LAYER_ID)) {
        syncGreenCanopy(map, ensureThreeBuildingLayer(map), false);
      }
    };
  }, [map, isMapLoaded, active, enabled]);
};
