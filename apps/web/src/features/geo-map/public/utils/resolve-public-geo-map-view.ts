import {
  DEFAULT_MAP_CENTER_LATITUDE,
  DEFAULT_MAP_CENTER_LONGITUDE,
  DEFAULT_MAP_ZOOM,
  MAX_MAP_ZOOM,
  MIN_MAP_ZOOM,
} from '@/features/geo-map/constants';
import type { GeoMapLngLat, GeoMapObject } from '@/features/geo-map/types';

export type PublicGeoMapView = {
  center: GeoMapLngLat;
  zoom: number;
};

const SINGLE_OBJECT_ZOOM = 14;
const FIT_ZOOM_MIN = 10;
const FIT_ZOOM_MAX = 15;
const MIN_SPAN_DEGREES = 0.01;

const clampZoom = (zoom: number): number => Math.min(MAX_MAP_ZOOM, Math.max(MIN_MAP_ZOOM, zoom));

const average = (values: number[]): number =>
  values.reduce((sum, value) => sum + value, 0) / values.length;

/**
 * Picks an initial camera for the public map from published object positions.
 */
export const resolvePublicGeoMapView = (
  objects: Pick<GeoMapObject, 'longitude' | 'latitude'>[],
): PublicGeoMapView => {
  if (objects.length === 0) {
    return {
      center: {
        longitude: DEFAULT_MAP_CENTER_LONGITUDE,
        latitude: DEFAULT_MAP_CENTER_LATITUDE,
      },
      zoom: DEFAULT_MAP_ZOOM,
    };
  }

  if (objects.length === 1) {
    const only = objects[0];
    if (!only) {
      return resolvePublicGeoMapView([]);
    }
    return {
      center: { longitude: only.longitude, latitude: only.latitude },
      zoom: SINGLE_OBJECT_ZOOM,
    };
  }

  const longitudes = objects.map((object) => object.longitude);
  const latitudes = objects.map((object) => object.latitude);
  const spanLng = Math.max(...longitudes) - Math.min(...longitudes);
  const spanLat = Math.max(...latitudes) - Math.min(...latitudes);
  const span = Math.max(spanLng, spanLat, MIN_SPAN_DEGREES);
  const fitZoom = Math.log2(360 / span) - 1;

  return {
    center: {
      longitude: average(longitudes),
      latitude: average(latitudes),
    },
    zoom: clampZoom(Math.min(FIT_ZOOM_MAX, Math.max(FIT_ZOOM_MIN, fitZoom))),
  };
};
