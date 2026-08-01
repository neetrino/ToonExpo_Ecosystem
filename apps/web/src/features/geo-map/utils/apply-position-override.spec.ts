import { describe, expect, it } from 'vitest';

import { applyPositionOverride } from '@/features/geo-map/utils/apply-position-override';
import type { GeoMapObject } from '@/features/geo-map/types';

const buildObject = (overrides: Partial<GeoMapObject> & { id: string }): GeoMapObject => ({
  projectId: overrides.id,
  label: 'Project',
  logoUrl: null,
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

describe('applyPositionOverride', () => {
  it('returns the same list unchanged when there is no override', () => {
    const objects = [buildObject({ id: 'a' })];
    expect(applyPositionOverride(objects, null)).toBe(objects);
  });

  it('replaces only the matching object longitude/latitude', () => {
    const target = buildObject({ id: 'a' });
    const other = buildObject({ id: 'b' });

    const result = applyPositionOverride([target, other], { id: 'a', longitude: 1, latitude: 2 });

    expect(result.find((item) => item.id === 'a')).toEqual({
      ...target,
      longitude: 1,
      latitude: 2,
    });
    expect(result.find((item) => item.id === 'b')).toEqual(other);
  });

  it('leaves the list unchanged when the override id does not match any object', () => {
    const objects = [buildObject({ id: 'a' })];
    const result = applyPositionOverride(objects, { id: 'missing', longitude: 1, latitude: 2 });
    expect(result).toEqual(objects);
  });
});
