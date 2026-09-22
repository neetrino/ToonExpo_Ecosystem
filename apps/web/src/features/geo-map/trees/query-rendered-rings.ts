import type { MapLibreMap } from 'maplibre-gl';

import { ringsFromGeometry } from '@/features/geo-map/trees/rings-from-geometry';
import type { LngLatRing } from '@/features/geo-map/trees/types';

/** Rings of features actually painted in the current map window. */
export const queryRenderedRings = (map: MapLibreMap, layerIds: readonly string[]): LngLatRing[] => {
  const layers = layerIds.filter((layerId) => Boolean(map.getLayer(layerId)));
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
