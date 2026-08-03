/**
 * OSM building identity helpers (trimmed from Map POC patterns).
 * Used by admin pick → place / hide-extrusion flows.
 */

import type { Geometry } from 'geojson';

export type BuildingGeometry =
  | { type: 'Polygon'; coordinates: number[][][] }
  | { type: 'MultiPolygon'; coordinates: number[][][][] };

export type SelectedOsmBuilding = {
  sourceOsmId: string | null;
  longitude: number;
  latitude: number;
  geometry: BuildingGeometry;
};

const OSM_KEYS = ['osm_id', 'osm_way_id', 'OSM_ID', '@id', 'id_osm'] as const;

const readString = (props: Record<string, unknown>, keys: readonly string[]): string | null => {
  for (const key of keys) {
    const value = props[key];
    if (value === null || value === undefined) {
      continue;
    }
    const text = String(value).trim();
    if (text.length > 0) {
      return text
        .replace(/^way\//, '')
        .replace(/^relation\//, '')
        .replace(/^node\//, '');
    }
  }
  return null;
};

/** Extracts a stable OSM id from OpenMapTiles / OpenFreeMap feature properties when present. */
export const resolveSourceOsmId = (properties: Record<string, unknown> | null): string | null => {
  if (!properties) {
    return null;
  }
  return readString(properties, OSM_KEYS);
};

const ringCentroid = (ring: number[][]): [number, number] => {
  if (ring.length === 0) {
    return [0, 0];
  }
  let twiceArea = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [x0 = 0, y0 = 0] = ring[j] ?? [];
    const [x1 = 0, y1 = 0] = ring[i] ?? [];
    const f = x0 * y1 - x1 * y0;
    twiceArea += f;
    cx += (x0 + x1) * f;
    cy += (y0 + y1) * f;
  }
  if (Math.abs(twiceArea) < 1e-12) {
    const avgLng = ring.reduce((sum, point) => sum + (point[0] ?? 0), 0) / ring.length;
    const avgLat = ring.reduce((sum, point) => sum + (point[1] ?? 0), 0) / ring.length;
    return [avgLng, avgLat];
  }
  return [cx / (3 * twiceArea), cy / (3 * twiceArea)];
};

const ringArea = (ring: number[][]): number => {
  let area = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [x0 = 0, y0 = 0] = ring[j] ?? [];
    const [x1 = 0, y1 = 0] = ring[i] ?? [];
    area += x0 * y1 - x1 * y0;
  }
  return area / 2;
};

/** Polygon / MultiPolygon centroid (largest polygon for MultiPolygon). */
export const computeFootprintCenter = (geometry: BuildingGeometry): [number, number] => {
  if (geometry.type === 'Polygon') {
    return ringCentroid(geometry.coordinates[0] ?? []);
  }

  let bestArea = -1;
  let best: [number, number] = [0, 0];
  for (const polygon of geometry.coordinates) {
    const ring = polygon[0] ?? [];
    const area = Math.abs(ringArea(ring));
    if (area > bestArea) {
      bestArea = area;
      best = ringCentroid(ring);
    }
  }
  return best;
};

export const isBuildingGeometry = (value: Geometry | null | undefined): value is BuildingGeometry =>
  Boolean(value && (value.type === 'Polygon' || value.type === 'MultiPolygon'));

const pointInRing = (longitude: number, latitude: number, ring: number[][]): boolean => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi = 0, yi = 0] = ring[i] ?? [];
    const [xj = 0, yj = 0] = ring[j] ?? [];
    const intersects =
      yi > latitude !== yj > latitude &&
      longitude < ((xj - xi) * (latitude - yi)) / (yj - yi + Number.EPSILON) + xi;
    if (intersects) {
      inside = !inside;
    }
  }
  return inside;
};

const pointInPolygonRings = (longitude: number, latitude: number, rings: number[][][]): boolean => {
  const outer = rings[0];
  if (!outer || !pointInRing(longitude, latitude, outer)) {
    return false;
  }
  for (let holeIndex = 1; holeIndex < rings.length; holeIndex += 1) {
    const hole = rings[holeIndex];
    if (hole && pointInRing(longitude, latitude, hole)) {
      return false;
    }
  }
  return true;
};

const squaredDistance = (lng: number, lat: number, center: [number, number]): number => {
  const dLng = lng - center[0];
  const dLat = lat - center[1];
  return dLng * dLng + dLat * dLat;
};

const nearestPolygonFromMulti = (
  longitude: number,
  latitude: number,
  coordinates: number[][][][],
): BuildingGeometry => {
  let bestDistance = Number.POSITIVE_INFINITY;
  let bestPolygon: number[][][] = coordinates[0] ?? [[]];

  for (const polygon of coordinates) {
    const ring = polygon[0] ?? [];
    const center = ringCentroid(ring);
    const distance = squaredDistance(longitude, latitude, center);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestPolygon = polygon;
    }
  }

  return { type: 'Polygon', coordinates: bestPolygon };
};

/**
 * When a vector tile feature is a MultiPolygon (or click misses the outer ring),
 * keep only the polygon part the user clicked — avoids highlighting distant footprints.
 */
export const narrowBuildingGeometryToClick = (
  click: { longitude: number; latitude: number },
  geometry: BuildingGeometry,
): BuildingGeometry => {
  const { longitude, latitude } = click;

  if (geometry.type === 'MultiPolygon') {
    for (const polygon of geometry.coordinates) {
      if (pointInPolygonRings(longitude, latitude, polygon)) {
        return { type: 'Polygon', coordinates: polygon };
      }
    }
    return nearestPolygonFromMulti(longitude, latitude, geometry.coordinates);
  }

  if (pointInPolygonRings(longitude, latitude, geometry.coordinates)) {
    return geometry;
  }

  return { type: 'Polygon', coordinates: [geometry.coordinates[0] ?? []] };
};
