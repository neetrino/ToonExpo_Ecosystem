'use client';

import type { MapLibreMap } from 'maplibre-gl';
import { useEffect } from 'react';

import { attachTraffic, type TrafficHandle } from '@/features/geo-map/traffic/traffic-controller';

export type UseVehicleLayerOptions = {
  map: MapLibreMap | null;
  isMapLoaded: boolean;
};

/**
 * Mounts sparse close-range animated traffic on admin and public geo-maps.
 */
export const useVehicleLayer = ({ map, isMapLoaded }: UseVehicleLayerOptions): void => {
  useEffect(() => {
    if (!map || !isMapLoaded) {
      return;
    }
    const handle: TrafficHandle = attachTraffic(map);
    return () => {
      handle.destroy();
    };
  }, [map, isMapLoaded]);
};
