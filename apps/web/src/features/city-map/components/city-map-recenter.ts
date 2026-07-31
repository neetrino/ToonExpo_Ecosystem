import type { Map as MapLibreMap } from 'maplibre-gl';
import maplibregl from 'maplibre-gl';

import {
  CITY_MAP_ARMENIA_BOUNDS,
  CITY_MAP_ARMENIA_FIT_MAX_ZOOM,
  CITY_MAP_ARMENIA_FIT_PADDING,
  CITY_MAP_PIN_FOCUS_ZOOM,
  type CityMapModelPose,
} from '../constants';

export type CityMapRecenterTarget =
  { kind: 'pin'; longitude: number; latitude: number } | { kind: 'armenia' };

/**
 * Prefer an explicitly selected placement (pin click / list select).
 * No selection → Armenia overview.
 */
export const resolveCityMapRecenterTarget = (
  models: CityMapModelPose[],
  selectedPlacementId: string | null,
): CityMapRecenterTarget => {
  if (!selectedPlacementId) {
    return { kind: 'armenia' };
  }
  const target = models.find((model) => model.id === selectedPlacementId);
  if (!target) {
    return { kind: 'armenia' };
  }
  return {
    kind: 'pin',
    longitude: target.longitude,
    latitude: target.latitude,
  };
};

export const applyCityMapRecenter = (map: MapLibreMap, target: CityMapRecenterTarget): void => {
  if (target.kind === 'pin') {
    map.flyTo({
      center: [target.longitude, target.latitude],
      zoom: Math.max(map.getZoom(), CITY_MAP_PIN_FOCUS_ZOOM),
      essential: true,
    });
    return;
  }

  const bounds = new maplibregl.LngLatBounds(
    [CITY_MAP_ARMENIA_BOUNDS.west, CITY_MAP_ARMENIA_BOUNDS.south],
    [CITY_MAP_ARMENIA_BOUNDS.east, CITY_MAP_ARMENIA_BOUNDS.north],
  );
  map.fitBounds(bounds, {
    padding: CITY_MAP_ARMENIA_FIT_PADDING,
    maxZoom: CITY_MAP_ARMENIA_FIT_MAX_ZOOM,
    duration: 900,
    pitch: 0,
    bearing: 0,
  });
};
