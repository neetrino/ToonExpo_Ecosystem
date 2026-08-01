'use client';

import type { MapLibreMap } from 'maplibre-gl';
import { useEffect, useState } from 'react';

import type { GeoMapLngLat } from '@/features/geo-map/types';

const MAP_CAMERA_EVENTS = ['move', 'zoom', 'pitch', 'rotate'] as const;

export type MapAnchoredScreenPoint = {
  x: number;
  y: number;
};

/** Projects a lng/lat anchor to container pixels; updates on camera changes. */
export const useMapAnchoredScreenPoint = (
  map: MapLibreMap | null,
  isMapLoaded: boolean,
  anchor: GeoMapLngLat | null,
): MapAnchoredScreenPoint | null => {
  const [point, setPoint] = useState<MapAnchoredScreenPoint | null>(null);

  useEffect(() => {
    if (!map || !isMapLoaded || !anchor) {
      setPoint(null);
      return;
    }

    const update = (): void => {
      const projected = map.project([anchor.longitude, anchor.latitude]);
      setPoint({ x: projected.x, y: projected.y });
    };

    update();
    for (const event of MAP_CAMERA_EVENTS) {
      map.on(event, update);
    }
    return () => {
      for (const event of MAP_CAMERA_EVENTS) {
        map.off(event, update);
      }
    };
  }, [map, isMapLoaded, anchor?.latitude, anchor?.longitude]);

  return anchor ? point : null;
};
