'use client';

import type { MapLibreMap } from 'maplibre-gl';
import { useEffect } from 'react';

import {
  attachVegetation,
  type VegetationHandle,
} from '@/features/geo-map/vegetation/vegetation-controller';

export type UseVegetationLayerOptions = {
  map: MapLibreMap | null;
  isMapLoaded: boolean;
};

/**
 * Mounts zoom-gated 3D park trees + grass on admin and public geo-maps.
 */
export const useVegetationLayer = ({ map, isMapLoaded }: UseVegetationLayerOptions): void => {
  useEffect(() => {
    if (!map || !isMapLoaded) {
      return;
    }
    const handle: VegetationHandle = attachVegetation(map);
    return () => {
      handle.destroy();
    };
  }, [map, isMapLoaded]);
};
