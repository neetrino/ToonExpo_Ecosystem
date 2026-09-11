import type { FilterSpecification, MapLibreMap } from 'maplibre-gl';

import { ringsFromGeometry } from '@/features/geo-map/trees/rings-from-geometry';
import type { LngLatRing } from '@/features/geo-map/trees/types';

type GreenSourceQuery = {
  sourceLayer: string;
  filter?: FilterSpecification;
};

const GREEN_SOURCE_QUERIES: readonly GreenSourceQuery[] = [
  { sourceLayer: 'park' },
  { sourceLayer: 'landcover', filter: ['==', 'class', 'wood'] },
  { sourceLayer: 'landcover', filter: ['==', 'class', 'grass'] },
];

const vectorSourceIds = (map: MapLibreMap): string[] => {
  const sources = map.getStyle()?.sources ?? {};
  return Object.keys(sources).filter((sourceId) => sources[sourceId]?.type === 'vector');
};

/** Park / wood / grass from loaded tiles — used when close zoom drops painted fills. */
export const querySourceGreenRings = (map: MapLibreMap): LngLatRing[] => {
  const rings: LngLatRing[] = [];
  for (const sourceId of vectorSourceIds(map)) {
    for (const query of GREEN_SOURCE_QUERIES) {
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
  }
  return rings;
};
