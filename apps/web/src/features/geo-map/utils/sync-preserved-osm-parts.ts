/**
 * Restores MultiPolygon sibling footprints after a shared parent feature id is
 * filtered out of `building-3d` (Manvel-Lambaryan/Map POC parity).
 *
 * Lookup matches every source feature with the hide feature id. Features that
 * contain the placement anchor are preferred; matching-id features whose nearest
 * outer-ring vertex is within the hide scope radius are also accepted (models
 * dragged off the original footprint). All sibling parts are restored — no
 * centroid radius cap.
 */

import type { Feature, FeatureCollection, Geometry, Polygon } from 'geojson';
import type { GeoJSONSource, MapLibreMap } from 'maplibre-gl';

import {
  OSM_BUILDING_EXTRUSION_LAYER_ID,
  OSM_BUILDING_EXTRUSION_MIN_ZOOM,
  OSM_BUILDING_HIDE_SCOPE_RADIUS_METERS,
  PRESERVED_OSM_PARTS_LAYER_ID,
  PRESERVED_OSM_PARTS_SOURCE_ID,
} from '@/features/geo-map/constants';
import { THREE_BUILDING_LAYER_ID } from '@/features/geo-map/three/constants';
import type { GeoMapLngLat, PreservedOsmSiblingPart } from '@/features/geo-map/types';
import { BRAND_MAP_BUILDING_EXTRUSION_TOP } from '@/features/geo-map/utils/brand-map-style-constants';
import {
  buildingGeometryContainsPoint,
  extractSiblingPolygons,
  isBuildingGeometry,
  narrowBuildingGeometryToClick,
  resolveExtrusionHeights,
  type BuildingGeometry,
  type BuildingPolygon,
} from '@/features/geo-map/utils/building-identification';
import { parseBuildingHideIdentity } from '@/features/geo-map/utils/building-hide-identity';
import {
  buildPreservedPartsSignature,
  dedupePreservedSiblingParts,
} from '@/features/geo-map/utils/preserved-osm-sibling-dedupe';

const DEFAULT_SIBLING_HEIGHT_M = 12;
const METERS_PER_DEGREE_LAT = 111_320;
const DEGREES_TO_RADIANS = Math.PI / 180;

const lastPartsSignatureByMap = new WeakMap<MapLibreMap, string>();

const approxDistanceMeters = (a: GeoMapLngLat, b: GeoMapLngLat): number => {
  const dLat = (b.latitude - a.latitude) * METERS_PER_DEGREE_LAT;
  const dLng =
    (b.longitude - a.longitude) * METERS_PER_DEGREE_LAT * Math.cos(a.latitude * DEGREES_TO_RADIANS);
  return Math.hypot(dLng, dLat);
};

const toFeature = (part: PreservedOsmSiblingPart): Feature<Polygon> => ({
  type: 'Feature',
  properties: {
    height: part.heightM,
    min_height: part.minHeightM,
  },
  geometry: part.geometry,
});

type LayerSourceInfo = {
  source: string;
  sourceLayer?: string;
};

const readBuildingLayerSource = (map: MapLibreMap): LayerSourceInfo | null => {
  const layer = map.getLayer(OSM_BUILDING_EXTRUSION_LAYER_ID) as
    { source?: unknown; sourceLayer?: unknown } | undefined;
  if (!layer || typeof layer.source !== 'string' || layer.source.length === 0) {
    return null;
  }
  return {
    source: layer.source,
    ...(typeof layer.sourceLayer === 'string' && layer.sourceLayer.length > 0
      ? { sourceLayer: layer.sourceLayer }
      : {}),
  };
};

const clonePolygon = (polygon: BuildingPolygon): BuildingPolygon => ({
  type: 'Polygon',
  coordinates: polygon.coordinates.map((ring) => ring.map((point) => [...point])),
});

const nearestOuterRingVertexDistanceMeters = (
  geometry: BuildingGeometry,
  anchor: GeoMapLngLat,
): number => {
  let nearest = Number.POSITIVE_INFINITY;
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  for (const rings of polygons) {
    for (const point of rings[0] ?? []) {
      const [lng, lat] = point;
      if (lng === undefined || lat === undefined) {
        continue;
      }
      nearest = Math.min(nearest, approxDistanceMeters(anchor, { longitude: lng, latitude: lat }));
    }
  }
  return nearest;
};

const isAcceptableMatchingFeature = (
  geometry: BuildingGeometry,
  longitude: number,
  latitude: number,
): boolean => {
  if (buildingGeometryContainsPoint(longitude, latitude, geometry)) {
    return true;
  }
  return (
    nearestOuterRingVertexDistanceMeters(geometry, { longitude, latitude }) <=
    OSM_BUILDING_HIDE_SCOPE_RADIUS_METERS
  );
};

type SourceBuildingFeature = {
  geometry: BuildingGeometry | Geometry | null;
  properties?: Record<string, unknown> | null;
};

const extractPartsFromFeature = (
  feature: SourceBuildingFeature,
  longitude: number,
  latitude: number,
): PreservedOsmSiblingPart[] => {
  if (!isBuildingGeometry(feature.geometry)) {
    return [];
  }
  const kept = narrowBuildingGeometryToClick({ longitude, latitude }, feature.geometry);
  if (kept.type !== 'Polygon') {
    return [];
  }
  const heights = resolveExtrusionHeights(
    feature.properties && typeof feature.properties === 'object' ? feature.properties : null,
  );
  return extractSiblingPolygons(feature.geometry, kept).map((polygon) => ({
    geometry: clonePolygon(polygon),
    heightM: heights.heightM,
    minHeightM: heights.minHeightM,
  }));
};

/**
 * Finds all vector features with the given id near the anchor and returns every
 * sibling ring (POC parity — no centroid radius filter on the result).
 */
export const resolvePreservedSiblingsFromMap = (
  map: MapLibreMap,
  featureId: string | number,
  longitude: number,
  latitude: number,
): PreservedOsmSiblingPart[] => {
  const sourceInfo = readBuildingLayerSource(map);
  if (!sourceInfo) {
    return [];
  }

  let features: ReturnType<MapLibreMap['querySourceFeatures']> = [];
  try {
    features = map.querySourceFeatures(sourceInfo.source, {
      ...(sourceInfo.sourceLayer ? { sourceLayer: sourceInfo.sourceLayer } : {}),
    });
  } catch {
    return [];
  }

  const collected: PreservedOsmSiblingPart[] = [];
  for (const feature of features) {
    if (feature.id === undefined || feature.id === null) {
      continue;
    }
    if (String(feature.id) !== String(featureId) || !isBuildingGeometry(feature.geometry)) {
      continue;
    }
    if (!isAcceptableMatchingFeature(feature.geometry, longitude, latitude)) {
      continue;
    }
    collected.push(...extractPartsFromFeature(feature, longitude, latitude));
  }
  return dedupePreservedSiblingParts(collected);
};

export type ModelSiblingLookup = {
  longitude: number;
  latitude: number;
  sourceOsmId?: string | null | undefined;
};

export type AdminHideSiblingLookup = {
  longitude: number;
  latitude: number;
  featureId?: string | number | null | undefined;
};

/** Live MultiPolygon siblings for models and admin-session hide targets. */
export const collectPreservedOsmSiblingParts = (
  map: MapLibreMap,
  models: readonly ModelSiblingLookup[],
  adminHiddenBuildings: readonly AdminHideSiblingLookup[] = [],
): PreservedOsmSiblingPart[] => {
  const parts: PreservedOsmSiblingPart[] = [];
  for (const model of models) {
    const identity = parseBuildingHideIdentity(model.sourceOsmId);
    if (identity.kind !== 'feature-id') {
      continue;
    }
    parts.push(
      ...resolvePreservedSiblingsFromMap(map, identity.value, model.longitude, model.latitude),
    );
  }
  for (const target of adminHiddenBuildings) {
    if (target.featureId === null || target.featureId === undefined) {
      continue;
    }
    parts.push(
      ...resolvePreservedSiblingsFromMap(map, target.featureId, target.longitude, target.latitude),
    );
  }
  return dedupePreservedSiblingParts(parts);
};

/** Ensures / updates the GeoJSON fill-extrusion layer for preserved siblings. */
export const syncPreservedOsmSiblingParts = (
  map: MapLibreMap,
  parts: readonly PreservedOsmSiblingPart[],
): void => {
  if (!map.isStyleLoaded()) {
    return;
  }

  const collection: FeatureCollection = {
    type: 'FeatureCollection',
    features: parts.map(toFeature),
  };
  const signature = buildPreservedPartsSignature(parts);
  const existing = map.getSource(PRESERVED_OSM_PARTS_SOURCE_ID) as GeoJSONSource | undefined;
  if (existing) {
    if (lastPartsSignatureByMap.get(map) !== signature) {
      existing.setData(collection);
    }
  } else {
    map.addSource(PRESERVED_OSM_PARTS_SOURCE_ID, { type: 'geojson', data: collection });
  }
  lastPartsSignatureByMap.set(map, signature);

  if (!map.getLayer(PRESERVED_OSM_PARTS_LAYER_ID)) {
    map.addLayer({
      id: PRESERVED_OSM_PARTS_LAYER_ID,
      type: 'fill-extrusion',
      source: PRESERVED_OSM_PARTS_SOURCE_ID,
      minzoom: OSM_BUILDING_EXTRUSION_MIN_ZOOM,
      paint: {
        'fill-extrusion-color': BRAND_MAP_BUILDING_EXTRUSION_TOP,
        'fill-extrusion-height': ['coalesce', ['get', 'height'], DEFAULT_SIBLING_HEIGHT_M],
        'fill-extrusion-base': ['coalesce', ['get', 'min_height'], 0],
        'fill-extrusion-opacity': 1,
        'fill-extrusion-vertical-gradient': true,
      },
    });
  }

  if (map.getLayer(THREE_BUILDING_LAYER_ID) && map.getLayer(PRESERVED_OSM_PARTS_LAYER_ID)) {
    try {
      map.moveLayer(PRESERVED_OSM_PARTS_LAYER_ID, THREE_BUILDING_LAYER_ID);
    } catch {
      /* layer order best-effort */
    }
  }
};

/** Removes preserved-sibling layers/source (style reload / unmount). */
export const removePreservedOsmSiblingParts = (map: MapLibreMap): void => {
  if (map.getLayer(PRESERVED_OSM_PARTS_LAYER_ID)) {
    map.removeLayer(PRESERVED_OSM_PARTS_LAYER_ID);
  }
  if (map.getSource(PRESERVED_OSM_PARTS_SOURCE_ID)) {
    map.removeSource(PRESERVED_OSM_PARTS_SOURCE_ID);
  }
};
