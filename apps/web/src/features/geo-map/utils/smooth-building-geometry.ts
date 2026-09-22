import type { BuildingGeometry } from '@/features/geo-map/utils/building-identification';
import { densifyBuildingArcRing } from '@/features/geo-map/utils/densify-building-arc-ring';
import { isCircularBuildingRing } from '@/features/geo-map/utils/is-circular-building-ring';
import { resampleCircularBuildingRing } from '@/features/geo-map/utils/resample-circular-building-ring';

const isRing = (value: unknown): value is number[][] =>
  Array.isArray(value) && value.length >= 4 && Array.isArray(value[0]);

const smoothRingIfNeeded = (ring: readonly (readonly number[])[]): number[][] | null => {
  if (isCircularBuildingRing(ring)) {
    return resampleCircularBuildingRing(ring);
  }
  const densified = densifyBuildingArcRing(ring);
  return densified.length > ring.length ? densified : null;
};

const smoothPolygon = (coordinates: unknown): number[][][] | null => {
  if (!Array.isArray(coordinates) || !isRing(coordinates[0])) {
    return null;
  }
  const outer = smoothRingIfNeeded(coordinates[0]);
  if (!outer) {
    return null;
  }
  const rings = [outer];
  for (let index = 1; index < coordinates.length; index += 1) {
    const hole = coordinates[index];
    if (!isRing(hole)) {
      return null;
    }
    rings.push(smoothRingIfNeeded(hole) ?? hole);
  }
  return rings;
};

/** Smooth only circular / arc-like footprints. Rectangles stay on the tile layer. */
export const smoothBuildingGeometry = (geometry: {
  type?: string;
  coordinates?: unknown;
}): BuildingGeometry | null => {
  if (geometry.type === 'Polygon') {
    const coordinates = smoothPolygon(geometry.coordinates);
    return coordinates ? { type: 'Polygon', coordinates } : null;
  }
  if (geometry.type !== 'MultiPolygon' || !Array.isArray(geometry.coordinates)) {
    return null;
  }
  const polygons: number[][][][] = [];
  let changed = false;
  for (const polygon of geometry.coordinates) {
    const coordinates = smoothPolygon(polygon);
    if (coordinates) {
      changed = true;
      polygons.push(coordinates);
      continue;
    }
    if (!Array.isArray(polygon)) {
      return null;
    }
    polygons.push(polygon as number[][][]);
  }
  return changed ? { type: 'MultiPolygon', coordinates: polygons } : null;
};
