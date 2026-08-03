'use client';

import type { MapLibreMap } from 'maplibre-gl';
import { useEffect } from 'react';

import type { AdminOsmHideSession, GeoMapObject } from '@/features/geo-map/types';
import { syncModelFootprintMasks } from '@/features/geo-map/utils/sync-model-footprint-masks';

export type UseModelFootprintMasksOptions = {
  map: MapLibreMap | null;
  isMapLoaded: boolean;
  /** Viewport-visible GLB models (same set as the Three.js building layer). */
  modelObjects: GeoMapObject[];
  /** Admin session hides for raw OSM extrusions (editable map only). */
  adminOsmHideSession?: AdminOsmHideSession | null | undefined;
};

/**
 * Keeps the OSM `building-3d` hide filter and preserved-sibling restoration in
 * sync with visible models. Re-runs on map `idle` because sibling lookup needs
 * vector tiles that may finish loading after the React state settled.
 */
export const useModelFootprintMasks = ({
  map,
  isMapLoaded,
  modelObjects,
  adminOsmHideSession = null,
}: UseModelFootprintMasksOptions): void => {
  useEffect(() => {
    if (!map || !isMapLoaded) {
      return;
    }
    const sync = (): void => {
      syncModelFootprintMasks(map, modelObjects, adminOsmHideSession);
    };
    sync();
    map.on('idle', sync);
    return () => {
      map.off('idle', sync);
    };
  }, [map, isMapLoaded, modelObjects, adminOsmHideSession]);
};
