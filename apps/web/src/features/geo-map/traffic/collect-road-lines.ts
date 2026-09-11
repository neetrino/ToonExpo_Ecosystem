import type { FilterSpecification, MapLibreMap } from 'maplibre-gl';

import {
  ROAD_RENDER_LAYER_IDS,
  ROAD_TRANSPORT_CLASSES,
} from '@/features/geo-map/traffic/constants';
import { linesFromGeometry } from '@/features/geo-map/traffic/lines-from-geometry';
import { roadLineKey } from '@/features/geo-map/traffic/path-pose';
import type { RoadLine } from '@/features/geo-map/traffic/types';

type RoadSourceQuery = {
  sourceLayer: string;
  filter?: FilterSpecification;
};

const ROAD_SOURCE_QUERY: RoadSourceQuery = {
  sourceLayer: 'transportation',
  filter: ['in', 'class', ...ROAD_TRANSPORT_CLASSES],
};

const vectorSourceIds = (map: MapLibreMap): string[] => {
  const sources = map.getStyle()?.sources ?? {};
  return Object.keys(sources).filter((sourceId) => sources[sourceId]?.type === 'vector');
};

const pushUniqueLines = (target: RoadLine[], incoming: readonly RoadLine[]): void => {
  const seen = new Set(target.map((line) => roadLineKey(line)));
  for (const line of incoming) {
    const key = roadLineKey(line);
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    target.push(line);
  }
};

const querySourceRoadLines = (map: MapLibreMap): RoadLine[] => {
  const lines: RoadLine[] = [];
  for (const sourceId of vectorSourceIds(map)) {
    try {
      const features = map.querySourceFeatures(sourceId, {
        sourceLayer: ROAD_SOURCE_QUERY.sourceLayer,
        ...(ROAD_SOURCE_QUERY.filter ? { filter: ROAD_SOURCE_QUERY.filter } : {}),
      });
      for (const feature of features) {
        pushUniqueLines(lines, linesFromGeometry(feature.geometry));
      }
    } catch {
      // Transportation layer may be absent on this tileset.
    }
  }
  return lines;
};

const queryRenderedRoadLines = (map: MapLibreMap): RoadLine[] => {
  const layers = ROAD_RENDER_LAYER_IDS.filter((layerId) => Boolean(map.getLayer(layerId)));
  if (layers.length === 0) {
    return [];
  }
  const canvas = map.getCanvas();
  const width = canvas.clientWidth || canvas.width;
  const height = canvas.clientHeight || canvas.height;
  const lines: RoadLine[] = [];
  for (const feature of map.queryRenderedFeatures(
    [
      [0, 0],
      [width, height],
    ],
    { layers: [...layers] },
  )) {
    pushUniqueLines(lines, linesFromGeometry(feature.geometry));
  }
  return lines;
};

/** Visible / loaded road centerlines from painted layers and vector tiles. */
export const collectRoadLinesFromMap = (map: MapLibreMap): RoadLine[] => {
  const lines = querySourceRoadLines(map);
  pushUniqueLines(lines, queryRenderedRoadLines(map));
  return lines;
};
