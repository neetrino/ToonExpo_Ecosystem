import type { MapLibreMap } from 'maplibre-gl';

import {
  extractParkFeatures,
  flattenParkPolygons,
  mergeParkRecords,
} from '@/features/geo-map/vegetation/park-feature-extractor';
import {
  polygonAreaM2,
  ringCentroid,
  type LngLat,
} from '@/features/geo-map/vegetation/polygon-geometry';
import type { ParkFeatureRecord } from '@/features/geo-map/vegetation/types';
import { VEGETATION_FEATURE_TYPES } from '@/features/geo-map/vegetation/vegetation-config';

const ACCEPT = new Set<string>(VEGETATION_FEATURE_TYPES);
const MIN_RENDERED_AREA_M2 = 40;

/**
 * Distinct green fills currently visible, nearest to map center first.
 */
export const listViewportGreenParks = (map: MapLibreMap): ParkFeatureRecord[] => {
  const style = map.getStyle();
  const sources = (style?.sources ?? {}) as Record<string, { type?: string } | undefined>;
  const sourceParks = extractParkFeatures(
    (sourceId, options) => map.querySourceFeatures(sourceId, options),
    sources,
  );

  const layerIds = greenFillLayerIds(map);
  const byKey = new Map<string, ParkFeatureRecord>();
  const sourceIndex = buildSourceIndex(sourceParks);

  if (layerIds.length > 0) {
    try {
      const rendered = map.queryRenderedFeatures(undefined, { layers: layerIds });
      for (const feature of rendered) {
        absorbRenderedFeature(feature, byKey, sourceIndex);
      }
    } catch {
      /* ignore */
    }
  }

  const bounds = map.getBounds();
  for (const record of sourceParks) {
    const existing = byKey.get(record.id);
    if (existing) {
      if (record.areaM2 > existing.areaM2 * 1.02) {
        byKey.set(record.id, record);
      }
      continue;
    }
    const [lng, lat] = record.centroid;
    if (
      lng >= bounds.getWest() &&
      lng <= bounds.getEast() &&
      lat >= bounds.getSouth() &&
      lat <= bounds.getNorth()
    ) {
      byKey.set(record.id, record);
    }
  }

  const list = [...byKey.values()];
  if (list.length === 0) {
    return sourceParks.slice(0, 12);
  }

  const center = map.getCenter();
  return list.sort((a, b) => {
    const da = (a.centroid[0] - center.lng) ** 2 + (a.centroid[1] - center.lat) ** 2;
    const db = (b.centroid[0] - center.lng) ** 2 + (b.centroid[1] - center.lat) ** 2;
    return da - db || b.areaM2 - a.areaM2;
  });
};

const buildSourceIndex = (sourceParks: ParkFeatureRecord[]): Map<string, ParkFeatureRecord> => {
  const index = new Map<string, ParkFeatureRecord>();
  for (const record of sourceParks) {
    index.set(record.id, record);
  }
  return index;
};

const absorbRenderedFeature = (
  feature: {
    id?: string | number | undefined;
    source: string;
    sourceLayer?: string | undefined;
    properties?: Record<string, unknown> | null | undefined;
    geometry?: GeoJSON.Geometry | null | undefined;
  },
  byKey: Map<string, ParkFeatureRecord>,
  sourceIndex: Map<string, ParkFeatureRecord>,
): void => {
  const geom = feature.geometry;
  if (!geom || (geom.type !== 'Polygon' && geom.type !== 'MultiPolygon')) {
    return;
  }
  const props = (feature.properties ?? {}) as Record<string, unknown>;
  const sourceLayer = feature.sourceLayer ?? 'park';
  if (!isAcceptedGreen(sourceLayer, props)) {
    return;
  }

  const rawId = feature.id ?? props['osm_id'] ?? props['id'];
  const fromSource =
    rawId !== undefined && rawId !== null
      ? sourceIndex.get(`${feature.source}:${sourceLayer}:${String(rawId)}`)
      : undefined;
  if (fromSource) {
    byKey.set(fromSource.id, fromSource);
    return;
  }

  const key = `${feature.source}:${sourceLayer}:${String(rawId ?? '')}`;
  const record = recordFromGeometry(feature.source, key, sourceLayer, geom, props);
  if (!record) {
    return;
  }
  const existing = byKey.get(record.id);
  byKey.set(record.id, existing ? mergeParkRecords(existing, record) : record);
};

const isAcceptedGreen = (sourceLayer: string, props: Record<string, unknown>): boolean => {
  if (sourceLayer === 'park') {
    return true;
  }
  const klass = String(props['class'] ?? '').toLowerCase();
  const subclass = String(props['subclass'] ?? props['leisure'] ?? '').toLowerCase();
  return ACCEPT.has(klass) || ACCEPT.has(subclass) || klass === 'grass' || klass === 'wood';
};

const greenFillLayerIds = (map: MapLibreMap): string[] =>
  (map.getStyle()?.layers ?? [])
    .filter((layer) => {
      if (layer.type !== 'fill') {
        return false;
      }
      const id = layer.id.toLowerCase();
      return (
        id === 'park' ||
        id.includes('park') ||
        id.includes('garden') ||
        id.includes('landcover') ||
        id.includes('grass') ||
        id.includes('wood') ||
        id.includes('forest') ||
        id.includes('pitch') ||
        id.includes('cemetery')
      );
    })
    .map((layer) => layer.id);

const recordFromGeometry = (
  source: string,
  key: string,
  sourceLayer: string,
  geom: GeoJSON.Polygon | GeoJSON.MultiPolygon,
  props: Record<string, unknown>,
): ParkFeatureRecord | null => {
  const record: ParkFeatureRecord = {
    id: key,
    source,
    sourceLayer,
    geometry: geom,
    properties: props,
    areaM2: 0,
    centroid: [0, 0],
  };
  let area = 0;
  let bestArea = 0;
  let centroid: LngLat = [0, 0];
  for (const poly of flattenParkPolygons(record)) {
    const a = polygonAreaM2(poly.ring);
    area += a;
    if (a > bestArea) {
      bestArea = a;
      centroid = ringCentroid(poly.ring);
    }
  }
  if (area < MIN_RENDERED_AREA_M2) {
    return null;
  }
  record.areaM2 = area;
  record.centroid = centroid;
  return record;
};
