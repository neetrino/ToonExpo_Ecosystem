import { describe, expect, it } from 'vitest';

import { queryRenderedRings } from '@/features/geo-map/trees/query-rendered-rings';

const parkRing: readonly (readonly [number, number])[] = [
  [44.51, 40.18],
  [44.52, 40.18],
  [44.52, 40.19],
  [44.51, 40.19],
  [44.51, 40.18],
];

const createMap = (layers: readonly string[]) => {
  const present = new Set(layers);
  return {
    getLayer: (layerId: string) => (present.has(layerId) ? {} : undefined),
    getCanvas: () => ({ clientWidth: 200, clientHeight: 200, width: 200, height: 200 }),
    queryRenderedFeatures: (_geometry: unknown, options: { layers: string[] }) => {
      if (!options.layers.includes('park')) {
        return [];
      }
      return [{ geometry: { type: 'Polygon', coordinates: [parkRing] } }];
    },
  };
};

describe('queryRenderedRings', () => {
  it('returns rings painted in the current window', () => {
    const rings = queryRenderedRings(createMap(['park']) as never, ['park']);
    expect(rings).toHaveLength(1);
    expect(rings[0]?.[0]).toEqual([44.51, 40.18]);
  });

  it('returns nothing when those layers are not in the window', () => {
    expect(queryRenderedRings(createMap([]) as never, ['park'])).toEqual([]);
  });
});
