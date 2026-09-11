import type { FilterSpecification, MapLibreMap } from 'maplibre-gl';

import { GREEN_MAP_LAYER_IDS } from '@/features/geo-map/trees/constants';
import { circleRing } from '@/features/geo-map/trees/circle-ring';
import { pointFromGeometry, ringsFromGeometry } from '@/features/geo-map/trees/rings-from-geometry';
import type { LngLatRing } from '@/features/geo-map/trees/types';

const PARK_POI_RADIUS_M = 90;

type GreenSourceQuery = {
  sourceLayer: string;
  filter?: FilterSpecification;
};

const GREEN_SOURCE_QUERIES: readonly GreenSourceQuery[] = [
  { sourceLayer: 'park' },
  { sourceLayer: 'landcover', filter: ['==', 'class', 'wood'] },
  { sourceLayer: 'landcover', filter: ['==', 'class', 'grass'] },
  {
    sourceLayer: 'landuse',
    filter: ['in', 'class', 'park', 'cemetery', 'recreation_ground', 'garden'],
  },
];

const PARK_POI_QUERY: GreenSourceQuery = {
  sourceLayer: 'poi',
  filter: ['in', 'class', 'park', 'garden'],
};

const vectorSourceIds = (map: MapLibreMap): string[] => {
  const sources = map.getStyle()?.sources ?? {};
  return Object.keys(sources).filter((sourceId) => sources[sourceId]?.type === 'vector');
};

const querySourceFeatures = (map: MapLibreMap, query: GreenSourceQuery) => {
  const rings: LngLatRing[] = [];
  for (const sourceId of vectorSourceIds(map)) {
    try {
      const features = map.querySourceFeatures(
        sourceId,
        query.filter
          ? { sourceLayer: query.sourceLayer, filter: query.filter }
          : { sourceLayer: query.sourceLayer },
      );
      for (const feature of features) {
        rings.push(...ringsFromGeometry(feature.geometry));
      }
    } catch {
      // Source layer may be absent on this tileset.
    }
  }
  return rings;
};

const queryRenderedGreenRings = (map: MapLibreMap): LngLatRing[] => {
  const layers = GREEN_MAP_LAYER_IDS.filter((layerId) => Boolean(map.getLayer(layerId)));
  if (layers.length === 0) {
    return [];
  }
  const canvas = map.getCanvas();
  const width = canvas.clientWidth || canvas.width;
  const height = canvas.clientHeight || canvas.height;
  const rings: LngLatRing[] = [];
  for (const feature of map.queryRenderedFeatures(
    [
      [0, 0],
      [width, height],
    ],
    { layers },
  )) {
    rings.push(...ringsFromGeometry(feature.geometry));
  }
  return rings;
};

const queryParkPoiRings = (map: MapLibreMap): LngLatRing[] => {
  const rings: LngLatRing[] = [];
  for (const sourceId of vectorSourceIds(map)) {
    try {
      const features = map.querySourceFeatures(sourceId, {
        sourceLayer: PARK_POI_QUERY.sourceLayer,
        ...(PARK_POI_QUERY.filter ? { filter: PARK_POI_QUERY.filter } : {}),
      });
      for (const feature of features) {
        const point = pointFromGeometry(feature.geometry);
        if (point) {
          rings.push(circleRing(point, PARK_POI_RADIUS_M));
        }
      }
    } catch {
      // POI source layer may be absent.
    }
  }
  return rings;
};

/**
 * Collect park / wood / grass rings from loaded tiles and the painted window.
 * Source queries keep working at high zoom when fill layers are no longer drawn.
 */
export const collectGreenRingsFromMap = (map: MapLibreMap): LngLatRing[] => {
  const rings = [
    ...GREEN_SOURCE_QUERIES.flatMap((query) => querySourceFeatures(map, query)),
    ...queryRenderedGreenRings(map),
  ];
  if (rings.length > 0) {
    return rings;
  }
  return queryParkPoiRings(map);
};
