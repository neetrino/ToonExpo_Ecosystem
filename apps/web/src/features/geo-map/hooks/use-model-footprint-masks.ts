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
 * Keeps the OSM `building-3d` distance filter in sync with visible models.
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
    syncModelFootprintMasks(map, modelObjects, adminOsmHideSession);
  }, [map, isMapLoaded, modelObjects, adminOsmHideSession]);
};
