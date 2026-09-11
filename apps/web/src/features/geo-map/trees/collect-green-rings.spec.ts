import { describe, expect, it } from 'vitest';

import { collectGreenRingsFromMap } from '@/features/geo-map/trees/collect-green-rings';

const parkRing: readonly (readonly [number, number])[] = [
  [44.51, 40.18],
  [44.52, 40.18],
  [44.52, 40.19],
  [44.51, 40.19],
  [44.51, 40.18],
];

describe('collectGreenRingsFromMap', () => {
  it('uses painted window fills when they exist', () => {
    const map = {
      getZoom: () => 15,
      getLayer: (layerId: string) => (layerId === 'park' ? {} : undefined),
      getCanvas: () => ({ clientWidth: 200, clientHeight: 200, width: 200, height: 200 }),
      queryRenderedFeatures: () => [{ geometry: { type: 'Polygon', coordinates: [parkRing] } }],
      getStyle: () => ({ sources: {} }),
      querySourceFeatures: () => [],
    };
    expect(collectGreenRingsFromMap(map as never)).toHaveLength(1);
  });

  it('keeps source rings together with painted fills so a park is not half-empty', () => {
    const map = {
      getZoom: () => 16,
      getLayer: (layerId: string) => (layerId === 'park' ? {} : undefined),
      getCanvas: () => ({ clientWidth: 200, clientHeight: 200, width: 200, height: 200 }),
      queryRenderedFeatures: () => [{ geometry: { type: 'Polygon', coordinates: [parkRing] } }],
      getStyle: () => ({ sources: { openmaptiles: { type: 'vector' } } }),
      querySourceFeatures: (_sourceId: string, options: { sourceLayer: string }) =>
        options.sourceLayer === 'park'
          ? [
              {
                geometry: {
                  type: 'Polygon',
                  coordinates: [
                    [
                      [44.52, 40.18],
                      [44.53, 40.18],
                      [44.53, 40.19],
                      [44.52, 40.19],
                      [44.52, 40.18],
                    ],
                  ],
                },
              },
            ]
          : [],
    };
    expect(collectGreenRingsFromMap(map as never)).toHaveLength(2);
  });

  it('falls back to tile source when close zoom has no painted fills', () => {
    const map = {
      getZoom: () => 18,
      getLayer: () => undefined,
      getCanvas: () => ({ clientWidth: 200, clientHeight: 200, width: 200, height: 200 }),
      queryRenderedFeatures: () => [],
      getStyle: () => ({ sources: { openmaptiles: { type: 'vector' } } }),
      querySourceFeatures: (_sourceId: string, options: { sourceLayer: string }) =>
        options.sourceLayer === 'park'
          ? [{ geometry: { type: 'Polygon', coordinates: [parkRing] } }]
          : [],
    };
    expect(collectGreenRingsFromMap(map as never)).toHaveLength(1);
  });
});
