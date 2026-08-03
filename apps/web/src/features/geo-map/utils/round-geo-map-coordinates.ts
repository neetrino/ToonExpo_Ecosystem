import { GEO_MAP_API_COORDINATE_DECIMALS } from '@/features/geo-map/constants';
import type { GeoMapLngLat } from '@/features/geo-map/types';
import { quantizeDecimal } from '@/features/geo-map/utils/geo-map-update-signatures';

/** Round a single coordinate to match admin geo-map API validation. */
export const roundGeoMapCoordinateForApi = (value: number): number =>
  quantizeDecimal(value, GEO_MAP_API_COORDINATE_DECIMALS);

/** Round map click / drag lng/lat before create or update requests. */
export const roundGeoMapLngLatForApi = (position: GeoMapLngLat): GeoMapLngLat => ({
  longitude: roundGeoMapCoordinateForApi(position.longitude),
  latitude: roundGeoMapCoordinateForApi(position.latitude),
});
