'use client';

import type { MapLibreMap, MapMouseEvent } from 'maplibre-gl';
import { useEffect, useRef } from 'react';

import { OSM_BUILDING_EXTRUSION_LAYER_ID } from '@/features/geo-map/constants';
import type { GeoMapLngLat } from '@/features/geo-map/types';

export type UseGeoMapEmptyClickOptions = {
  map: MapLibreMap | null;
  isMapLoaded: boolean;
  /** Admin place-on-empty-map; leave false on public maps. */
  enabled: boolean;
  onMapClick?: ((position: GeoMapLngLat) => void) | undefined;
};

/**
 * Fires `onMapClick` for empty basemap clicks. Skips OSM `building-3d` hits so
 * `useOsmBuildingPick` owns those. Markers stopPropagation on their own click.
 */
export const useGeoMapEmptyClick = ({
  map,
  isMapLoaded,
  enabled,
  onMapClick,
}: UseGeoMapEmptyClickOptions): void => {
  const onMapClickRef = useRef(onMapClick);
  onMapClickRef.current = onMapClick;

  useEffect(() => {
    if (!map || !isMapLoaded || !enabled) {
      return;
    }

    const handleClick = (event: MapMouseEvent): void => {
      if (map.getLayer(OSM_BUILDING_EXTRUSION_LAYER_ID)) {
        const osmHits = map.queryRenderedFeatures(event.point, {
          layers: [OSM_BUILDING_EXTRUSION_LAYER_ID],
        });
        if (osmHits.length > 0) {
          return;
        }
      }
      onMapClickRef.current?.({ longitude: event.lngLat.lng, latitude: event.lngLat.lat });
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [map, isMapLoaded, enabled]);
};
