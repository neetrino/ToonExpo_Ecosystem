import { DEG_TO_RAD, EARTH_RADIUS_M } from '@/features/geo-map/trees/constants';
import type { GreenLngLat } from '@/features/geo-map/trees/types';

/** Equirectangular distance in meters — enough for viewport-scale canopy work. */
export const distanceM = (from: GreenLngLat, to: GreenLngLat): number => {
  const meanLat = ((from.latitude + to.latitude) / 2) * DEG_TO_RAD;
  const dLat = (to.latitude - from.latitude) * DEG_TO_RAD;
  const dLng = (to.longitude - from.longitude) * DEG_TO_RAD;
  const east = dLng * Math.cos(meanLat);
  return Math.hypot(east, dLat) * EARTH_RADIUS_M;
};
