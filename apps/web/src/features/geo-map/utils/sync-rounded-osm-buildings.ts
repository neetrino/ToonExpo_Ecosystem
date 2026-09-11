import type { Feature, FeatureCollection } from 'geojson';
import type { ExpressionSpecification, GeoJSONSource, MapLibreMap } from 'maplibre-gl';

import {
  OSM_BUILDING_EXTRUSION_LAYER_ID,
  OSM_BUILDING_EXTRUSION_MIN_ZOOM,
  OSM_SMOOTH_CIRCLE_CORNER_RADIUS_M,
  OSM_SMOOTH_CIRCLE_MAX_FEATURES,
  OSM_SMOOTH_CIRCLE_OPACITY,
  ROUNDED_OSM_BUILDINGS_LAYER_ID,
  ROUNDED_OSM_BUILDINGS_SOURCE_ID,
} from '@/features/geo-map/constants';
import { THREE_BUILDING_LAYER_ID } from '@/features/geo-map/three/constants';
import { applyOsmBuildingCornerRadius } from '@/features/geo-map/utils/apply-osm-building-corner-radius';
import {
  BUILDING_HEIGHT_EXPR,
  realisticBuildingColorExpr,
} from '@/features/geo-map/utils/building-color-expr';
import { BRAND_MAP_BUILDING_EXTRUSION_TOP } from '@/features/geo-map/utils/brand-map-style-constants';
import {
  MAP_BUILDING_EXTRUSION_AO_INTENSITY,
  MAP_BUILDING_EXTRUSION_VERTICAL_GRADIENT,
} from '@/features/geo-map/utils/map-atmosphere-constants';
import { mapStyleIsReady } from '@/features/geo-map/utils/map-style-is-ready';
import { smoothBuildingGeometry } from '@/features/geo-map/utils/smooth-building-geometry';
import { toWorkerSafeProperties } from '@/features/geo-map/utils/to-worker-safe-properties';

const setExtrusionPaintSafe = (
  map: MapLibreMap,
  layerId: string,
  property: 'fill-extrusion-opacity' | 'fill-extrusion-ambient-occlusion-intensity',
  value: number,
): void => {
  try {
    (map.setPaintProperty as (id: string, name: string, next: unknown) => void)(
      layerId,
      property,
      value,
    );
  } catch {
    /* property unsupported on this MapLibre / style build */
  }
};

const polishNativeBuildings = (map: MapLibreMap): void => {
  applyOsmBuildingCornerRadius(map, OSM_BUILDING_EXTRUSION_LAYER_ID);
  setExtrusionPaintSafe(
    map,
    OSM_BUILDING_EXTRUSION_LAYER_ID,
    'fill-extrusion-ambient-occlusion-intensity',
    MAP_BUILDING_EXTRUSION_AO_INTENSITY,
  );
};

const BUILDING_MIN_HEIGHT_EXPR: ExpressionSpecification = [
  'coalesce',
  ['get', 'render_min_height'],
  ['get', 'min_height'],
  0,
];

const lastSignatureByMap = new WeakMap<MapLibreMap, string>();
const overlayTunedByMap = new WeakSet<MapLibreMap>();

const addSmoothOverlayLayer = (map: MapLibreMap): void => {
  map.addLayer({
    id: ROUNDED_OSM_BUILDINGS_LAYER_ID,
    type: 'fill-extrusion',
    source: ROUNDED_OSM_BUILDINGS_SOURCE_ID,
    minzoom: OSM_BUILDING_EXTRUSION_MIN_ZOOM,
    layout: {
      'fill-extrusion-rounded-corner-distance': OSM_SMOOTH_CIRCLE_CORNER_RADIUS_M,
    },
    paint: {
      'fill-extrusion-color': realisticBuildingColorExpr(BRAND_MAP_BUILDING_EXTRUSION_TOP),
      'fill-extrusion-height': BUILDING_HEIGHT_EXPR,
      'fill-extrusion-base': BUILDING_MIN_HEIGHT_EXPR,
      'fill-extrusion-opacity': OSM_SMOOTH_CIRCLE_OPACITY,
      'fill-extrusion-vertical-gradient': MAP_BUILDING_EXTRUSION_VERTICAL_GRADIENT,
    },
  });
  applyOsmBuildingCornerRadius(
    map,
    ROUNDED_OSM_BUILDINGS_LAYER_ID,
    OSM_SMOOTH_CIRCLE_CORNER_RADIUS_M,
  );
  setExtrusionPaintSafe(
    map,
    ROUNDED_OSM_BUILDINGS_LAYER_ID,
    'fill-extrusion-ambient-occlusion-intensity',
    MAP_BUILDING_EXTRUSION_AO_INTENSITY,
  );
  polishNativeBuildings(map);
  if (!map.getLayer(THREE_BUILDING_LAYER_ID)) {
    return;
  }
  try {
    map.moveLayer(ROUNDED_OSM_BUILDINGS_LAYER_ID, THREE_BUILDING_LAYER_ID);
  } catch {
    /* keep overlay above OSM boxes */
  }
};

const tuneSmoothOverlayLayer = (map: MapLibreMap): void => {
  if (overlayTunedByMap.has(map)) {
    return;
  }
  overlayTunedByMap.add(map);
  setExtrusionPaintSafe(
    map,
    ROUNDED_OSM_BUILDINGS_LAYER_ID,
    'fill-extrusion-opacity',
    OSM_SMOOTH_CIRCLE_OPACITY,
  );
  setExtrusionPaintSafe(
    map,
    ROUNDED_OSM_BUILDINGS_LAYER_ID,
    'fill-extrusion-ambient-occlusion-intensity',
    MAP_BUILDING_EXTRUSION_AO_INTENSITY,
  );
  polishNativeBuildings(map);
  applyOsmBuildingCornerRadius(
    map,
    ROUNDED_OSM_BUILDINGS_LAYER_ID,
    OSM_SMOOTH_CIRCLE_CORNER_RADIUS_M,
  );
};

const emptyCollection = (): FeatureCollection => ({
  type: 'FeatureCollection',
  features: [],
});

const featureKey = (feature: { id?: unknown }): string =>
  feature.id === undefined || feature.id === null ? '' : String(feature.id);

const ensureSmoothLayer = (map: MapLibreMap): GeoJSONSource | null => {
  if (!mapStyleIsReady(map) || !map.getLayer(OSM_BUILDING_EXTRUSION_LAYER_ID)) {
    return null;
  }
  if (!map.getSource(ROUNDED_OSM_BUILDINGS_SOURCE_ID)) {
    map.addSource(ROUNDED_OSM_BUILDINGS_SOURCE_ID, {
      type: 'geojson',
      data: emptyCollection(),
    });
  }
  if (map.getLayer(ROUNDED_OSM_BUILDINGS_LAYER_ID)) {
    tuneSmoothOverlayLayer(map);
  } else {
    addSmoothOverlayLayer(map);
  }
  return (map.getSource(ROUNDED_OSM_BUILDINGS_SOURCE_ID) as GeoJSONSource | undefined) ?? null;
};

const collectSmoothFeatures = (map: MapLibreMap): Feature[] => {
  if (!map.getLayer(OSM_BUILDING_EXTRUSION_LAYER_ID)) {
    return [];
  }
  const canvas = map.getCanvas();
  const features: Feature[] = [];
  const seen = new Set<string>();
  for (const feature of map.queryRenderedFeatures(
    [
      [0, 0],
      [canvas.clientWidth || canvas.width, canvas.clientHeight || canvas.height],
    ],
    { layers: [OSM_BUILDING_EXTRUSION_LAYER_ID] },
  )) {
    if (features.length >= OSM_SMOOTH_CIRCLE_MAX_FEATURES) {
      break;
    }
    const key = featureKey(feature);
    if (key && seen.has(key)) {
      continue;
    }
    const geometry = smoothBuildingGeometry(feature.geometry);
    if (!geometry) {
      continue;
    }
    if (key) {
      seen.add(key);
    }
    features.push({
      type: 'Feature',
      id: typeof feature.id === 'number' || typeof feature.id === 'string' ? feature.id : undefined,
      properties: toWorkerSafeProperties(feature.properties),
      geometry,
    });
  }
  return features;
};

/** Overlay smooth cylinders on faceted OSM circles. Tile buildings stay as-is. */
export const syncRoundedOsmBuildings = (map: MapLibreMap): void => {
  const source = ensureSmoothLayer(map);
  if (!source) {
    return;
  }
  if (map.getZoom() < OSM_BUILDING_EXTRUSION_MIN_ZOOM) {
    if (lastSignatureByMap.get(map) !== 'empty') {
      source.setData(emptyCollection());
      lastSignatureByMap.set(map, 'empty');
    }
    return;
  }
  const features = collectSmoothFeatures(map);
  const signature = `${features.length}:${features.map((feature) => featureKey(feature)).join('|')}`;
  if (signature === lastSignatureByMap.get(map)) {
    return;
  }
  source.setData({ type: 'FeatureCollection', features });
  lastSignatureByMap.set(map, signature);
};

export const removeRoundedOsmBuildings = (map: MapLibreMap): void => {
  lastSignatureByMap.delete(map);
  overlayTunedByMap.delete(map);
  if (!mapStyleIsReady(map)) {
    return;
  }
  if (map.getLayer(ROUNDED_OSM_BUILDINGS_LAYER_ID)) {
    map.removeLayer(ROUNDED_OSM_BUILDINGS_LAYER_ID);
  }
  if (map.getSource(ROUNDED_OSM_BUILDINGS_SOURCE_ID)) {
    map.removeSource(ROUNDED_OSM_BUILDINGS_SOURCE_ID);
  }
};
