import type { ParkFeatureRecord } from '@/features/geo-map/vegetation/types';
import {
  polygonAreaM2,
  ringCentroid,
  type LngLat,
} from '@/features/geo-map/vegetation/polygon-geometry';
import { VEGETATION_FEATURE_TYPES } from '@/features/geo-map/vegetation/vegetation-config';

const ACCEPT = new Set<string>(VEGETATION_FEATURE_TYPES);
const MIN_PARK_AREA_M2 = 80;

type SourceFeature = {
  id?: string | number | undefined;
  properties?: Record<string, unknown> | null | undefined;
  geometry?: GeoJSON.Geometry | null | undefined;
};

/**
 * Extract park / green polygons from loaded OpenMapTiles vector sources.
 * Same OSM id can appear as multiple tile-clipped fragments — merge them.
 */
export const extractParkFeatures = (
  querySourceFeatures: (
    sourceId: string,
    options: { sourceLayer: string },
  ) => readonly SourceFeature[],
  sources: Record<string, { type?: string } | undefined>,
): ParkFeatureRecord[] => {
  const byId = new Map<string, ParkFeatureRecord>();

  for (const [sourceId, source] of Object.entries(sources)) {
    if (!source || source.type !== 'vector') {
      continue;
    }
    for (const sourceLayer of ['park', 'landcover', 'landuse'] as const) {
      let features: readonly SourceFeature[] = [];
      try {
        features = querySourceFeatures(sourceId, { sourceLayer });
      } catch {
        continue;
      }
      for (const feature of features) {
        const record = toParkRecord(feature, sourceId, sourceLayer);
        if (!record) {
          continue;
        }
        const existing = byId.get(record.id);
        byId.set(record.id, existing ? mergeParkRecords(existing, record) : record);
      }
    }
  }

  return [...byId.values()].sort((a, b) => b.areaM2 - a.areaM2);
};

export const mergeParkRecords = (a: ParkFeatureRecord, b: ParkFeatureRecord): ParkFeatureRecord => {
  const coords = [...geometryToPolygonCoords(a.geometry), ...geometryToPolygonCoords(b.geometry)];
  const geometry: GeoJSON.MultiPolygon = { type: 'MultiPolygon', coordinates: coords };
  const { areaM2, centroid } = measureGeometry(geometry);
  return {
    id: a.id,
    source: a.source,
    sourceLayer: a.sourceLayer,
    geometry,
    properties: { ...a.properties, ...b.properties },
    areaM2,
    centroid,
  };
};

export const flattenParkPolygons = (
  feature: ParkFeatureRecord,
): Array<{ ring: LngLat[]; holes: LngLat[][] }> => {
  const geometry = feature.geometry;
  if (geometry.type === 'Polygon') {
    const coords = geometry.coordinates as LngLat[][];
    return [{ ring: coords[0] ?? [], holes: coords.slice(1) }];
  }
  return geometry.coordinates.map((poly) => ({
    ring: (poly[0] ?? []) as LngLat[],
    holes: poly.slice(1) as LngLat[][],
  }));
};

const toParkRecord = (
  feature: SourceFeature,
  source: string,
  sourceLayer: string,
): ParkFeatureRecord | null => {
  const props = (feature.properties ?? {}) as Record<string, unknown>;
  const klass = String(props['class'] ?? '').toLowerCase();
  const subclass = String(props['subclass'] ?? props['leisure'] ?? '').toLowerCase();

  if (sourceLayer !== 'park' && !ACCEPT.has(klass) && !ACCEPT.has(subclass)) {
    if (klass !== 'grass' && klass !== 'wood') {
      return null;
    }
  }

  const geometry = feature.geometry;
  if (!geometry || (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon')) {
    return null;
  }

  const { areaM2, centroid } = measureGeometry(geometry);
  if (areaM2 < MIN_PARK_AREA_M2) {
    return null;
  }

  const rawId =
    feature.id ??
    props['osm_id'] ??
    props['id'] ??
    `${centroid[0].toFixed(5)},${centroid[1].toFixed(5)}`;

  return {
    id: `${source}:${sourceLayer}:${String(rawId)}`,
    source,
    sourceLayer,
    geometry,
    properties: props,
    areaM2,
    centroid,
  };
};

const geometryToPolygonCoords = (
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon,
): GeoJSON.Position[][][] =>
  geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;

const measureGeometry = (
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon,
): { areaM2: number; centroid: LngLat } => {
  const rings = flattenRings(geometry);
  let areaM2 = 0;
  let best: LngLat = [0, 0];
  let bestArea = 0;
  for (const ring of rings) {
    const area = polygonAreaM2(ring);
    areaM2 += area;
    if (area > bestArea) {
      bestArea = area;
      best = ringCentroid(ring);
    }
  }
  return { areaM2, centroid: best };
};

const flattenRings = (geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon): LngLat[][] => {
  if (geometry.type === 'Polygon') {
    return geometry.coordinates[0] ? [geometry.coordinates[0] as LngLat[]] : [];
  }
  return geometry.coordinates
    .map((poly) => poly[0] as LngLat[] | undefined)
    .filter((ring): ring is LngLat[] => Boolean(ring && ring.length >= 3));
};
