import type { BuildingGeometry } from '@/features/geo-map/utils/building-identification';
import { roundBuildingRing } from '@/features/geo-map/utils/round-building-ring';

const isRing = (value: unknown): value is number[][] =>
  Array.isArray(value) && value.length >= 4 && Array.isArray(value[0]);

const roundPolygon = (coordinates: unknown): number[][][] | null => {
  if (!Array.isArray(coordinates) || coordinates.length === 0) {
    return null;
  }
  const rings: number[][][] = [];
  for (const ring of coordinates) {
    if (!isRing(ring)) {
      return null;
    }
    rings.push(roundBuildingRing(ring));
  }
  return rings;
};

/** Fillet Polygon / MultiPolygon building footprints. */
export const roundBuildingGeometry = (geometry: {
  type?: string;
  coordinates?: unknown;
}): BuildingGeometry | null => {
  if (geometry.type === 'Polygon') {
    const coordinates = roundPolygon(geometry.coordinates);
    return coordinates ? { type: 'Polygon', coordinates } : null;
  }
  if (geometry.type !== 'MultiPolygon' || !Array.isArray(geometry.coordinates)) {
    return null;
  }
  const polygons: number[][][][] = [];
  for (const polygon of geometry.coordinates) {
    const coordinates = roundPolygon(polygon);
    if (!coordinates) {
      return null;
    }
    polygons.push(coordinates);
  }
  return { type: 'MultiPolygon', coordinates: polygons };
};
