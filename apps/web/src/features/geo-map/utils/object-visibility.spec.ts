import { describe, expect, it } from 'vitest';

import {
  hasReachedModelZoom,
  splitObjectsByVisibility,
} from '@/features/geo-map/utils/object-visibility';
import type { LngLatBounds } from '@/features/geo-map/utils/geo-bounds';
import type { GeoMapObject } from '@/features/geo-map/types';

const buildObject = (overrides: Partial<GeoMapObject> & { id: string }): GeoMapObject => ({
  projectId: overrides.id,
  label: 'Project',
  modelUrl: 'https://cdn.example/model.glb',
  longitude: 44.5152,
  latitude: 40.1872,
  altitudeM: 0,
  headingDeg: 0,
  pitchDeg: 0,
  rollDeg: 0,
  scale: 1,
  minZoom: 14,
  ...overrides,
});

const bounds: LngLatBounds = { west: 44, south: 40, east: 45, north: 41 };

describe('hasReachedModelZoom', () => {
  it('returns false below minZoom and true at/above it', () => {
    expect(hasReachedModelZoom(13.9, 14)).toBe(false);
    expect(hasReachedModelZoom(14, 14)).toBe(true);
    expect(hasReachedModelZoom(15, 14)).toBe(true);
  });
});

describe('splitObjectsByVisibility', () => {
  it('shows a marker below minZoom and a model at/above minZoom', () => {
    const object = buildObject({ id: 'a', minZoom: 14 });

    expect(splitObjectsByVisibility([object], 13, bounds)).toEqual({
      markerObjects: [object],
      modelObjects: [],
    });
    expect(splitObjectsByVisibility([object], 14, bounds)).toEqual({
      markerObjects: [],
      modelObjects: [object],
    });
  });

  it('drops out-of-viewport models even though a marker would still show with the wider margin', () => {
    const object = buildObject({ id: 'far', minZoom: 10, longitude: 45.2, latitude: 40.5 });

    // Outside the tight model margin (bounds.east + 0.05°) but within the wide marker margin (+0.5°).
    const { markerObjects, modelObjects } = splitObjectsByVisibility([object], 12, bounds);
    expect(modelObjects).toEqual([]);
    expect(markerObjects).toEqual([]);
  });

  it('skips the viewport check entirely when bounds are not yet known', () => {
    const object = buildObject({ id: 'no-bounds', longitude: 100, latitude: 60 });
    expect(splitObjectsByVisibility([object], 20, null).modelObjects).toEqual([object]);
  });

  it('partitions a mixed list correctly', () => {
    const belowThreshold = buildObject({ id: 'below', minZoom: 16 });
    const aboveThreshold = buildObject({ id: 'above', minZoom: 10 });

    const result = splitObjectsByVisibility([belowThreshold, aboveThreshold], 12, bounds);
    expect(result.markerObjects.map((item) => item.id)).toEqual(['below']);
    expect(result.modelObjects.map((item) => item.id)).toEqual(['above']);
  });
});
