import { describe, expect, it } from 'vitest';

import type { MapLibreMap } from 'maplibre-gl';

import { PRESERVED_OSM_PARTS_SOURCE_ID } from '@/features/geo-map/constants';
import { syncModelFootprintMasks } from '@/features/geo-map/utils/sync-model-footprint-masks';

const square = (west: number, south: number, size: number): number[][] => [
  [west, south],
  [west + size, south],
  [west + size, south + size],
  [west, south + size],
  [west, south],
];

type FakeMapOptions = {
  features?: readonly Record<string, unknown>[];
  sourceLoaded?: boolean;
};

const createFakeMap = (options: FakeMapOptions = {}) => {
  const layers = new Set<string>(['building-3d']);
  const sources = new Map<string, { setData: (data: unknown) => void }>();
  let sourceLoaded = options.sourceLoaded ?? false;
  let setFilterCalls = 0;
  let lastFilter: unknown;

  const map = {
    getLayer: (id: string) => {
      if (!layers.has(id)) {
        return undefined;
      }
      if (id === 'building-3d') {
        return { source: 'openmaptiles', sourceLayer: 'building' };
      }
      return { source: PRESERVED_OSM_PARTS_SOURCE_ID };
    },
    getSource: (id: string) => sources.get(id),
    isSourceLoaded: (id: string) => {
      if (!sources.has(id)) {
        throw new Error(`missing source ${id}`);
      }
      return sourceLoaded;
    },
    isStyleLoaded: () => true,
    querySourceFeatures: () => options.features ?? [],
    setFilter: (_layerId: string, filter: unknown) => {
      setFilterCalls += 1;
      lastFilter = filter;
    },
    addSource: (id: string) => {
      sources.set(id, { setData: () => undefined });
    },
    addLayer: (layer: { id: string }) => {
      layers.add(layer.id);
    },
    moveLayer: () => undefined,
    removeLayer: (id: string) => {
      layers.delete(id);
    },
    removeSource: (id: string) => {
      sources.delete(id);
    },
  };

  return {
    map: map as unknown as MapLibreMap,
    setSourceLoaded: (value: boolean): void => {
      sourceLoaded = value;
    },
    getSetFilterCalls: (): number => setFilterCalls,
    getLastFilter: (): unknown => lastFilter,
  };
};

describe('syncModelFootprintMasks filter gating', () => {
  const nearOuter = square(44.51, 40.18, 0.0002);
  const farOuter = square(44.5104, 40.18, 0.0002);

  it('defers setFilter while preserved parts exist and the source is not loaded', () => {
    const fake = createFakeMap({
      sourceLoaded: false,
      features: [
        {
          id: 42,
          type: 'Feature',
          properties: { height: 18 },
          geometry: {
            type: 'MultiPolygon',
            coordinates: [[nearOuter], [farOuter]],
          },
        },
      ],
    });

    const adminOsmHide = {
      hiddenBuildings: [
        { longitude: 44.5101, latitude: 40.1801, featureId: 42, osmId: null },
      ],
    };

    syncModelFootprintMasks(fake.map, [], adminOsmHide);
    expect(fake.getSetFilterCalls()).toBe(0);

    fake.setSourceLoaded(true);
    syncModelFootprintMasks(fake.map, [], adminOsmHide);
    expect(fake.getSetFilterCalls()).toBe(1);
    expect(fake.getLastFilter()).not.toBeNull();
  });

  it('applies setFilter immediately when no preserved parts are required', () => {
    const fake = createFakeMap({ sourceLoaded: false, features: [] });

    syncModelFootprintMasks(fake.map, [
      { id: 'm1', longitude: 44.51, latitude: 40.18, sourceOsmId: null },
    ]);

    expect(fake.getSetFilterCalls()).toBe(1);
  });
});
