import { describe, expect, it } from 'vitest';

import {
  getScenegraphObjectOrientation,
  getScenegraphObjectPosition,
  getScenegraphObjectScale,
  groupObjectsByModelUrl,
} from '@/features/geo-map/utils/scenegraph-layer-props';
import type { GeoMapObject } from '@/features/geo-map/types';

const buildObject = (overrides: Partial<GeoMapObject> & { id: string }): GeoMapObject => ({
  projectId: overrides.id,
  label: 'Project',
  modelUrl: 'https://cdn.example/a.glb',
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

describe('groupObjectsByModelUrl', () => {
  it('groups objects that share a GLB url into a single layer group', () => {
    const shared = 'https://cdn.example/shared.glb';
    const groups = groupObjectsByModelUrl([
      buildObject({ id: 'a', modelUrl: shared }),
      buildObject({ id: 'b', modelUrl: shared }),
      buildObject({ id: 'c', modelUrl: 'https://cdn.example/other.glb' }),
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0]?.modelUrl).toBe(shared);
    expect(groups[0]?.data.map((datum) => datum.id)).toEqual(['a', 'b']);
    expect(groups[1]?.modelUrl).toBe('https://cdn.example/other.glb');
  });

  it('assigns a stable, unique layer id per group', () => {
    const groups = groupObjectsByModelUrl([
      buildObject({ id: 'a', modelUrl: 'https://cdn.example/a.glb' }),
      buildObject({ id: 'b', modelUrl: 'https://cdn.example/b.glb' }),
    ]);

    const ids = groups.map((group) => group.layerId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('returns an empty array for no objects', () => {
    expect(groupObjectsByModelUrl([])).toEqual([]);
  });
});

describe('scenegraph accessors', () => {
  const datum = groupObjectsByModelUrl([
    buildObject({
      id: 'a',
      longitude: 1,
      latitude: 2,
      altitudeM: 3,
      headingDeg: 90,
      pitchDeg: 10,
      rollDeg: 20,
      scale: 2,
    }),
  ])[0]?.data[0];

  it('builds position as [lng, lat, altitude]', () => {
    expect(datum && getScenegraphObjectPosition(datum)).toEqual([1, 2, 3]);
  });

  it('builds orientation as [pitch, yaw, roll]', () => {
    expect(datum && getScenegraphObjectOrientation(datum)).toEqual([10, 90, 20]);
  });

  it('builds a uniform scale vector', () => {
    expect(datum && getScenegraphObjectScale(datum)).toEqual([2, 2, 2]);
  });
});
