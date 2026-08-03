import type { MapLibreMap } from 'maplibre-gl';

import {
  VEHICLE_MAX_ROAD_SEGMENTS,
  VEHICLE_MIN_ROAD_LENGTH_M,
} from '@/features/geo-map/traffic/traffic-config';
import type { LngLatTuple, RoadLine } from '@/features/geo-map/traffic/types';

const DRIVABLE = new Set([
  'motorway',
  'trunk',
  'primary',
  'secondary',
  'tertiary',
  'residential',
  'unclassified',
  'living_street',
  'service',
]);

/**
 * Extract drivable roads from loaded OpenMapTiles vector sources (no Overpass).
 */
export const extractRoadsFromVectorTiles = (map: MapLibreMap): RoadLine[] => {
  const style = map.getStyle();
  if (!style?.sources) {
    return [];
  }

  const roads: RoadLine[] = [];
  const seen = new Set<string>();

  for (const [sourceId, source] of Object.entries(style.sources)) {
    if (!source || typeof source !== 'object' || source.type !== 'vector') {
      continue;
    }
    let features: ReturnType<MapLibreMap['querySourceFeatures']> = [];
    try {
      features = map.querySourceFeatures(sourceId, { sourceLayer: 'transportation' });
    } catch {
      continue;
    }
    for (const feature of features) {
      appendRoadFeatures(feature, sourceId, roads, seen);
    }
  }

  return roads
    .filter((road) => road.lengthM >= VEHICLE_MIN_ROAD_LENGTH_M)
    .sort((a, b) => b.lengthM - a.lengthM)
    .slice(0, VEHICLE_MAX_ROAD_SEGMENTS);
};

export const lineLengthMeters = (coords: LngLatTuple[]): number => {
  let sum = 0;
  for (let i = 1; i < coords.length; i++) {
    sum += approxMeters(coords[i - 1]!, coords[i]!);
  }
  return sum;
};

export const approxMeters = (a: LngLatTuple, b: LngLatTuple): number => {
  const midLat = ((a[1] + b[1]) / 2) * (Math.PI / 180);
  const dx = (b[0] - a[0]) * Math.cos(midLat) * 111_320;
  const dy = (b[1] - a[1]) * 110_540;
  return Math.hypot(dx, dy);
};

export const bearingDeg = (a: LngLatTuple, b: LngLatTuple): number => {
  const toRad = (d: number): number => (d * Math.PI) / 180;
  const φ1 = toRad(a[1]);
  const φ2 = toRad(b[1]);
  const Δλ = toRad(b[0] - a[0]);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
};

export const sampleAlongRoad = (
  road: RoadLine,
  distanceM: number,
): { lng: number; lat: number; bearing: number } => {
  const coords = road.coords;
  if (coords.length < 2) {
    const point = coords[0] ?? [0, 0];
    return { lng: point[0], lat: point[1], bearing: 0 };
  }

  let remaining = Math.max(0, Math.min(distanceM, road.lengthM - 0.01));
  for (let i = 1; i < coords.length; i++) {
    const a = coords[i - 1]!;
    const b = coords[i]!;
    const seg = approxMeters(a, b);
    if (remaining <= seg || i === coords.length - 1) {
      const t = seg > 0 ? remaining / seg : 0;
      return {
        lng: a[0] + (b[0] - a[0]) * t,
        lat: a[1] + (b[1] - a[1]) * t,
        bearing: bearingDeg(a, b),
      };
    }
    remaining -= seg;
  }

  const last = coords[coords.length - 1]!;
  const prev = coords[coords.length - 2]!;
  return { lng: last[0], lat: last[1], bearing: bearingDeg(prev, last) };
};

/** Pure helper: how many cars to spawn for a road set under a hard cap. */
export const computeSpawnBudget = (
  roads: readonly RoadLine[],
  spacingM: number,
  maxVehicles: number,
): number => {
  if (roads.length === 0 || spacingM <= 0 || maxVehicles <= 0) {
    return 0;
  }
  const totalM = roads.reduce((sum, road) => sum + road.lengthM, 0);
  return Math.min(maxVehicles, Math.max(0, Math.floor(totalM / spacingM)));
};

const appendRoadFeatures = (
  feature: {
    id?: string | number | undefined;
    properties?: Record<string, unknown> | null | undefined;
    geometry?: GeoJSON.Geometry | null | undefined;
  },
  sourceId: string,
  roads: RoadLine[],
  seen: Set<string>,
): void => {
  const props = (feature.properties ?? {}) as Record<string, unknown>;
  const klass = String(props['class'] ?? props['highway'] ?? '');
  if (!DRIVABLE.has(klass)) {
    return;
  }
  const geom = feature.geometry;
  if (!geom) {
    return;
  }
  const lines: LngLatTuple[][] = [];
  if (geom.type === 'LineString') {
    lines.push(geom.coordinates as LngLatTuple[]);
  } else if (geom.type === 'MultiLineString') {
    for (const line of geom.coordinates) {
      lines.push(line as LngLatTuple[]);
    }
  } else {
    return;
  }

  for (let i = 0; i < lines.length; i++) {
    const coords = lines[i]!.filter((c) => Number.isFinite(c[0]) && Number.isFinite(c[1]));
    if (coords.length < 2) {
      continue;
    }
    const lengthM = lineLengthMeters(coords);
    if (lengthM < VEHICLE_MIN_ROAD_LENGTH_M) {
      continue;
    }
    const id = `${sourceId}:${String(feature.id ?? props['osm_id'] ?? props['id'] ?? 'x')}:${i}:${coords[0]![0].toFixed(5)}`;
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);
    roads.push({ id, coords, highway: klass, lengthM });
  }
};
