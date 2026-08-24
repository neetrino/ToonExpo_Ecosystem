import { describe, expect, it } from 'vitest';

import type { GeoMapObject } from '@/features/geo-map/types';
import { filterMapObjectsByLabel } from '@/features/geo-map/utils/filter-map-objects-by-label';

const objects: GeoMapObject[] = [
  {
    id: 'a',
    projectId: 'a',
    projectSlug: 'a',
    label: 'Ajapnyak Terrace',
    logoUrl: null,
    addressLine: 'Bashinjaghyan 18 · Yerevan',
    modelUrl: '/a.glb',
    sourceOsmId: null,
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
    projectSlug: 'b',
    label: 'Cascade Heights',
    logoUrl: null,
    addressLine: null,
    modelUrl: '/b.glb',
    sourceOsmId: null,
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
