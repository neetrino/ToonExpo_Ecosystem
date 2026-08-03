import type { MapLibreMap } from 'maplibre-gl';

import {
  lngLatToLocalMeters,
  pointInRing,
  type LngLat,
  type MeterPoint,
} from '@/features/geo-map/vegetation/polygon-geometry';

export type ExclusionSet = {
  buildingRings: MeterPoint[][];
  waterRings: MeterPoint[][];
  version: string;
};

const MAX_BUILDING_RINGS = 300;
const MAX_WATER_RINGS = 60;

/**
 * Collect exclusion geometries once per vegetation rebuild (not per frame).
 */
export const collectExclusions = (map: MapLibreMap, origin: LngLat): ExclusionSet => {
  const style = map.getStyle();
  const buildingRings: MeterPoint[][] = [];
  const waterRings: MeterPoint[][] = [];
  let versionBits = 0;

  if (!style?.sources) {
    return { buildingRings, waterRings, version: '0' };
  }

  for (const [sourceId, source] of Object.entries(style.sources)) {
    if (!source || typeof source !== 'object' || source.type !== 'vector') {
      continue;
    }
    versionBits += pullPolygons(
      map,
      sourceId,
      'building',
      origin,
      buildingRings,
      MAX_BUILDING_RINGS,
    );
    versionBits += pullPolygons(map, sourceId, 'water', origin, waterRings, MAX_WATER_RINGS);
  }

  return { buildingRings, waterRings, version: String(versionBits) };
};

export const isPointExcluded = (
  lng: number,
  lat: number,
  origin: LngLat,
  exclusions: ExclusionSet,
): boolean => {
  const point = lngLatToLocalMeters(origin[0], origin[1], lng, lat);
  for (const ring of exclusions.waterRings) {
    if (pointInRing(point, ring)) {
      return true;
    }
  }
  for (const ring of exclusions.buildingRings) {
    if (pointInRing(point, ring)) {
      return true;
    }
  }
  return false;
};

const pullPolygons = (
  map: MapLibreMap,
  sourceId: string,
  sourceLayer: string,
  origin: LngLat,
  out: MeterPoint[][],
  limit: number,
): number => {
  let features: ReturnType<MapLibreMap['querySourceFeatures']> = [];
  try {
    features = map.querySourceFeatures(sourceId, { sourceLayer });
  } catch {
    return 0;
  }
  let added = 0;
  for (const feature of features) {
    if (out.length >= limit) {
      break;
    }
    const geom = feature.geometry;
    if (!geom) {
      continue;
    }
    for (const ring of outerRings(geom)) {
      if (out.length >= limit) {
        break;
      }
      out.push(ring.map((c) => lngLatToLocalMeters(origin[0], origin[1], c[0], c[1])));
      added++;
    }
  }
  return added;
};

const outerRings = (geom: GeoJSON.Geometry): LngLat[][] => {
  if (geom.type === 'Polygon') {
    return [geom.coordinates[0] as LngLat[]];
  }
  if (geom.type === 'MultiPolygon') {
    return geom.coordinates.map((poly) => poly[0] as LngLat[]);
  }
  return [];
};
