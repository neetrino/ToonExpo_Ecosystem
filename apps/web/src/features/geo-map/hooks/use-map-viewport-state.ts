'use client';

import type { MapLibreMap } from 'maplibre-gl';
import { useEffect, useState } from 'react';

import type { LngLatBounds } from '@/features/geo-map/utils/geo-bounds';

export type MapViewportState = {
  zoom: number;
  bounds: LngLatBounds | null;
};

const readViewportState = (map: MapLibreMap): MapViewportState => {
  const bounds = map.getBounds();
  return {
    zoom: map.getZoom(),
    bounds: {
      west: bounds.getWest(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      north: bounds.getNorth(),
    },
  };
};

/** Tracks the map's zoom and viewport bounds, updating on every camera move. */
export const useMapViewportState = (
  map: MapLibreMap | null,
  isMapLoaded: boolean,
  initialZoom: number,
): MapViewportState => {
  const [viewport, setViewport] = useState<MapViewportState>({ zoom: initialZoom, bounds: null });

  useEffect(() => {
    if (!map || !isMapLoaded) {
      return;
    }

    const handleMove = () => setViewport(readViewportState(map));
    handleMove();
    map.on('move', handleMove);

    return () => {
      map.off('move', handleMove);
    };
  }, [map, isMapLoaded]);

  return viewport;
};
