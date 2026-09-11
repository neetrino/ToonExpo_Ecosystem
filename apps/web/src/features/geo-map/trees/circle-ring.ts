import { DEG_TO_RAD, METERS_PER_DEG_LAT } from '@/features/geo-map/trees/constants';
import type { GreenLngLat, LngLatRing } from '@/features/geo-map/trees/types';

const CIRCLE_SEGMENTS = 24;

/** Approximate geographic circle used when only a park POI point is available. */
export const circleRing = (center: GreenLngLat, radiusM: number): LngLatRing => {
  const metersPerDegLng =
    METERS_PER_DEG_LAT * Math.max(Math.cos(center.latitude * DEG_TO_RAD), 0.2);
  const ring: [number, number][] = [];
  for (let index = 0; index <= CIRCLE_SEGMENTS; index += 1) {
    const angle = (index / CIRCLE_SEGMENTS) * Math.PI * 2;
    ring.push([
      center.longitude + (Math.cos(angle) * radiusM) / metersPerDegLng,
      center.latitude + (Math.sin(angle) * radiusM) / METERS_PER_DEG_LAT,
    ]);
  }
  return ring;
};
