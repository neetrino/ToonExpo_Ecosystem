import type { LngLatRing } from '@/features/geo-map/trees/types';

const MIN_RING_POINTS = 4;

const asPosition = (value: unknown): readonly [number, number] | null => {
  if (!Array.isArray(value) || value.length < 2) {
    return null;
  }
  const lng = Number(value[0]);
  const lat = Number(value[1]);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    return null;
  }
  return [lng, lat];
};

const ringFromCoords = (coords: unknown): LngLatRing | null => {
  if (!Array.isArray(coords) || coords.length < MIN_RING_POINTS) {
    return null;
  }
  const ring: [number, number][] = [];
  for (const pair of coords) {
    const position = asPosition(pair);
    if (!position) {
      return null;
    }
    ring.push([position[0], position[1]]);
  }
  return ring;
};

const pointFromCoords = (coords: unknown): readonly [number, number] | null => asPosition(coords);

export const ringsFromGeometry = (geometry: {
  type?: string;
  coordinates?: unknown;
}): LngLatRing[] => {
  if (geometry.type === 'Polygon') {
    const outer = Array.isArray(geometry.coordinates) ? geometry.coordinates[0] : null;
    const ring = ringFromCoords(outer);
    return ring ? [ring] : [];
  }
  if (geometry.type !== 'MultiPolygon' || !Array.isArray(geometry.coordinates)) {
    return [];
  }
  const rings: LngLatRing[] = [];
  for (const polygon of geometry.coordinates) {
    const outer = Array.isArray(polygon) ? polygon[0] : null;
    const ring = ringFromCoords(outer);
    if (ring) {
      rings.push(ring);
    }
  }
  return rings;
};

export const pointFromGeometry = (geometry: {
  type?: string;
  coordinates?: unknown;
}): { longitude: number; latitude: number } | null => {
  if (geometry.type !== 'Point') {
    return null;
  }
  const position = pointFromCoords(geometry.coordinates);
  if (!position) {
    return null;
  }
  return { longitude: position[0], latitude: position[1] };
};
