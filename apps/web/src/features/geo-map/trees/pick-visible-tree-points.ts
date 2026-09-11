import {
  GREEN_CANOPY_MAX_VISIBLE,
  GREEN_CANOPY_SCALE_MIN,
  GREEN_CANOPY_SCALE_SPAN,
} from '@/features/geo-map/trees/constants';
import { greenHashUnit } from '@/features/geo-map/trees/green-hash';
import type { CanopyTreeInstance, GreenLngLat } from '@/features/geo-map/trees/types';

const toInstance = (point: GreenLngLat): CanopyTreeInstance => {
  const seed = `${point.longitude.toFixed(5)}:${point.latitude.toFixed(5)}`;
  return {
    longitude: point.longitude,
    latitude: point.latitude,
    headingDeg: greenHashUnit(`${seed}:h`) * 360,
    scale: GREEN_CANOPY_SCALE_MIN + greenHashUnit(`${seed}:s`) * GREEN_CANOPY_SCALE_SPAN,
  };
};

const pointKey = (point: GreenLngLat): string =>
  `${point.longitude.toFixed(5)}:${point.latitude.toFixed(5)}`;

/**
 * Keep every world-grid tree. Cap by stable key so zoom never reshuffles
 * which trees exist in the same park.
 */
export const pickVisibleTreePoints = (
  points: readonly GreenLngLat[],
  maxPoints: number = GREEN_CANOPY_MAX_VISIBLE,
): CanopyTreeInstance[] => {
  const unique = new Map<string, GreenLngLat>();
  for (const point of points) {
    unique.set(pointKey(point), point);
  }
  return [...unique.values()]
    .sort((left, right) => pointKey(left).localeCompare(pointKey(right)))
    .slice(0, maxPoints)
    .map(toInstance);
};
