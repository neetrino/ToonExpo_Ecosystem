import { closeBuildingRing, openBuildingRing } from '@/features/geo-map/utils/open-building-ring';

const MIN_CIRCLE_VERTICES = 6;
const MAX_CIRCLE_VERTICES = 48;
const MIN_COMPACTNESS = 0.78;
const MAX_RADIUS_RATIO = 1.2;

const ringAreaAndPerimeter = (
  ring: readonly (readonly number[])[],
): { area: number; perimeter: number } => {
  let area = 0;
  let perimeter = 0;
  for (let index = 0; index < ring.length - 1; index += 1) {
    const current = ring[index];
    const next = ring[index + 1];
    if (!current || !next) {
      continue;
    }
    area += (current[0] ?? 0) * (next[1] ?? 0) - (next[0] ?? 0) * (current[1] ?? 0);
    perimeter += Math.hypot((next[0] ?? 0) - (current[0] ?? 0), (next[1] ?? 0) - (current[1] ?? 0));
  }
  return { area: Math.abs(area) / 2, perimeter };
};

const radiusStats = (open: readonly (readonly number[])[]): { min: number; max: number } => {
  let sumLng = 0;
  let sumLat = 0;
  for (const point of open) {
    sumLng += point[0] ?? 0;
    sumLat += point[1] ?? 0;
  }
  const centerLng = sumLng / open.length;
  const centerLat = sumLat / open.length;
  let min = Infinity;
  let max = 0;
  for (const point of open) {
    const radius = Math.hypot((point[0] ?? 0) - centerLng, (point[1] ?? 0) - centerLat);
    min = Math.min(min, radius);
    max = Math.max(max, radius);
  }
  return { min, max };
};

/** True when an OSM footprint is a faceted circle (hex / octagon / 12-gon). */
export const isCircularBuildingRing = (ring: readonly (readonly number[])[]): boolean => {
  const open = openBuildingRing(ring);
  if (open.length < MIN_CIRCLE_VERTICES || open.length > MAX_CIRCLE_VERTICES) {
    return false;
  }
  const closed = closeBuildingRing(open);
  const { area, perimeter } = ringAreaAndPerimeter(closed);
  if (perimeter <= 0) {
    return false;
  }
  const compactness = (4 * Math.PI * area) / (perimeter * perimeter);
  if (compactness < MIN_COMPACTNESS) {
    return false;
  }
  const { min, max } = radiusStats(open);
  return min > 0 && max / min <= MAX_RADIUS_RATIO;
};
