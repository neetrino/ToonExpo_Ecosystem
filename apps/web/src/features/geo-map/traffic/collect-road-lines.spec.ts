import { describe, expect, it } from 'vitest';

import { collectRoadLinesFromMap } from '@/features/geo-map/traffic/collect-road-lines';

const street: readonly (readonly [number, number])[] = [
  [44.51, 40.18],
  [44.52, 40.18],
];

describe('collectRoadLinesFromMap', () => {
  it('uses painted road layers when they exist', () => {
    const map = {
      getLayer: (layerId: string) => (layerId === 'road_minor' ? {} : undefined),
      getCanvas: () => ({ clientWidth: 200, clientHeight: 200, width: 200, height: 200 }),
      queryRenderedFeatures: () => [{ geometry: { type: 'LineString', coordinates: street } }],
      getStyle: () => ({ sources: {} }),
      querySourceFeatures: () => [],
    };
    expect(collectRoadLinesFromMap(map as never)).toHaveLength(1);
  });

  it('reads transportation tiles when painted roads are missing', () => {
    const map = {
      getLayer: () => undefined,
      getCanvas: () => ({ clientWidth: 200, clientHeight: 200, width: 200, height: 200 }),
      queryRenderedFeatures: () => [],
      getStyle: () => ({ sources: { openmaptiles: { type: 'vector' } } }),
      querySourceFeatures: (_sourceId: string, options: { sourceLayer: string }) =>
        options.sourceLayer === 'transportation'
          ? [{ geometry: { type: 'LineString', coordinates: street } }]
          : [],
    };
    expect(collectRoadLinesFromMap(map as never)).toHaveLength(1);
  });
});
