import {
  GEO_MAP_DEFAULT_CREATE_VALUES,
  GEO_MAP_PREVIEW_MIN_ZOOM,
  GEO_MAP_PREVIEW_PIN_ID,
} from '@/features/geo-map/admin/constants';
import type { GeoMapLngLat, GeoMapObject } from '@/features/geo-map/types';

/**
 * Client-only map object for an unsaved address pin (no API create).
 */
export const buildGeoMapPreviewObject = (
  position: GeoMapLngLat,
  label: string,
): GeoMapObject => ({
  id: GEO_MAP_PREVIEW_PIN_ID,
  projectId: null,
  projectSlug: null,
  label,
  logoUrl: null,
  addressLine: null,
  modelUrl: GEO_MAP_PREVIEW_PIN_ID,
  sourceOsmId: null,
  longitude: position.longitude,
  latitude: position.latitude,
  altitudeM: GEO_MAP_DEFAULT_CREATE_VALUES.altitudeM,
  headingDeg: GEO_MAP_DEFAULT_CREATE_VALUES.headingDeg,
  pitchDeg: GEO_MAP_DEFAULT_CREATE_VALUES.pitchDeg,
  rollDeg: GEO_MAP_DEFAULT_CREATE_VALUES.rollDeg,
  scale: GEO_MAP_DEFAULT_CREATE_VALUES.scale,
  minZoom: GEO_MAP_PREVIEW_MIN_ZOOM,
});
