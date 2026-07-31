import { describe, expect, it } from 'vitest';

import type { GeoMapObject } from '@/features/geo-map/types';
import { filterMapObjectsByLabel } from '@/features/geo-map/utils/filter-map-objects-by-label';

const objects: GeoMapObject[] = [
  {
    id: 'a',
    projectId: 'a',
    label: 'Ajapnyak Terrace',
    modelUrl: '/a.glb',
    longitude: 44.5,
    latitude: 40.18,
    altitudeM: 0,
    headingDeg: 0,
    pitchDeg: 0,
    rollDeg: 0,
    scale: 1,
    minZoom: 14,
  },
  {
    id: 'b',
    projectId: 'b',
    label: 'Cascade Heights',
    modelUrl: '/b.glb',
    longitude: 44.51,
    latitude: 40.19,
    altitudeM: 0,
    headingDeg: 0,
    pitchDeg: 0,
    rollDeg: 0,
    scale: 1,
    minZoom: 14,
  },
];

describe('filterMapObjectsByLabel', () => {
  it('returns all objects for an empty query', () => {
    expect(filterMapObjectsByLabel(objects, '   ')).toHaveLength(2);
  });

  it('matches case-insensitive substrings', () => {
    expect(filterMapObjectsByLabel(objects, 'ajap').map((o) => o.id)).toEqual(['a']);
    expect(filterMapObjectsByLabel(objects, 'TERRACE').map((o) => o.id)).toEqual(['a']);
  });

  it('returns an empty list when nothing matches', () => {
    expect(filterMapObjectsByLabel(objects, 'xyz')).toEqual([]);
  });
});
