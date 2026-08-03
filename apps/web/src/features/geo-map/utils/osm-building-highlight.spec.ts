import { describe, expect, it } from 'vitest';

import type { MapLibreMap } from 'maplibre-gl';

import type { BuildingGeometry } from '@/features/geo-map/utils/building-identification';
import {
  OSM_HIGHLIGHT_SOURCE_ID,
  removeOsmHighlightLayers,
  setOsmHighlightedBuilding,
} from '@/features/geo-map/utils/osm-building-highlight';

const sampleGeometry: BuildingGeometry = {
  type: 'Polygon',
  coordinates: [
    [
      [44.51, 40.18],
      [44.5102, 40.18],
      [44.5102, 40.1802],
      [44.51, 40.1802],
      [44.51, 40.18],
    ],
  ],
};

const createFakeMap = (options: { styleLoaded: boolean }) => {
  let styleLoaded = options.styleLoaded;
  let setDataCalls = 0;
  const layers = new Set<string>();
  const sources = new Map<string, { setData: (data: unknown) => void }>();

  const map = {
    isStyleLoaded: () => styleLoaded,
    getSource: (id: string) => sources.get(id),
    getLayer: (id: string) => (layers.has(id) ? { id } : undefined),
    addSource: (id: string) => {
      sources.set(id, {
        setData: () => {
          setDataCalls += 1;
        },
      });
    },
    addLayer: (layer: { id: string }) => {
      layers.add(layer.id);
    },
    removeLayer: (id: string) => {
      layers.delete(id);
    },
    removeSource: (id: string) => {
      sources.delete(id);
    },
  };

  return {
    map: map as unknown as MapLibreMap,
    setStyleLoaded: (value: boolean): void => {
      styleLoaded = value;
    },
    getSetDataCalls: (): number => setDataCalls,
    hasHighlightSource: (): boolean => sources.has(OSM_HIGHLIGHT_SOURCE_ID),
  };
};

describe('setOsmHighlightedBuilding', () => {
  it('skips work when the geometry is the same reference as last applied', () => {
    const fake = createFakeMap({ styleLoaded: true });
    setOsmHighlightedBuilding(fake.map, sampleGeometry);
    expect(fake.getSetDataCalls()).toBe(1);

    setOsmHighlightedBuilding(fake.map, sampleGeometry);
    expect(fake.getSetDataCalls()).toBe(1);
  });

  it('does not record on style-not-loaded early return so a retry can apply', () => {
    const fake = createFakeMap({ styleLoaded: false });
    setOsmHighlightedBuilding(fake.map, sampleGeometry);
    expect(fake.getSetDataCalls()).toBe(0);
    expect(fake.hasHighlightSource()).toBe(false);

    fake.setStyleLoaded(true);
    setOsmHighlightedBuilding(fake.map, sampleGeometry);
    expect(fake.getSetDataCalls()).toBe(1);
  });

  it('clears the applied record when highlight layers are removed', () => {
    const fake = createFakeMap({ styleLoaded: true });
    setOsmHighlightedBuilding(fake.map, sampleGeometry);
    removeOsmHighlightLayers(fake.map);
    setOsmHighlightedBuilding(fake.map, sampleGeometry);
    expect(fake.getSetDataCalls()).toBe(2);
  });
});
