import { GEO_MAP_MAX_ABS_LATITUDE, GEO_MAP_MAX_ABS_LONGITUDE } from '@/features/geo-map/constants';
import type { GeoMapLngLat } from '@/features/geo-map/types';

/**
 * Whether a lng/lat pair is safe to render or persist.
 *
 * Rejects missing / `NaN` / `Infinity` values and out-of-range coordinates —
 * which also catches reversed pairs whenever the latitude slot holds a value
 * outside ±{@link GEO_MAP_MAX_ABS_LATITUDE}.
 */
export const isValidGeoMapLngLat = (position: GeoMapLngLat): boolean => {
  const { longitude, latitude } = position;
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
    return false;
  }
  return (
    Math.abs(longitude) <= GEO_MAP_MAX_ABS_LONGITUDE &&
    Math.abs(latitude) <= GEO_MAP_MAX_ABS_LATITUDE
  );
};
