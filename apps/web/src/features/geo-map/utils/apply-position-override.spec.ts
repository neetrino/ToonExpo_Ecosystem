import { describe, expect, it } from 'vitest';

import {
  applyPositionOverride,
  applyTransformOverride,
} from '@/features/geo-map/utils/apply-position-override';
import type { GeoMapObject } from '@/features/geo-map/types';

const buildObject = (overrides: Partial<GeoMapObject> & { id: string }): GeoMapObject => ({
  projectId: overrides.id,
  label: 'Project',
  logoUrl: null,
  modelUrl: 'https://cdn.example/a.glb',
  sourceOsmId: null,
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

describe('applyTransformOverride', () => {
  it('returns the same list unchanged when there is no override', () => {
    const objects = [buildObject({ id: 'a' })];
    expect(applyTransformOverride(objects, null)).toBe(objects);
  });

  it('replaces only the matching object longitude/latitude', () => {
    const target = buildObject({ id: 'a' });
    const other = buildObject({ id: 'b' });

    const result = applyTransformOverride([target, other], {
      id: 'a',
      longitude: 1,
      latitude: 2,
    });

    expect(result.find((item) => item.id === 'a')).toEqual({
      ...target,
      longitude: 1,
      latitude: 2,
    });
    expect(result.find((item) => item.id === 'b')).toEqual(other);
  });

  it('applies full transform fields when provided', () => {
    const target = buildObject({ id: 'a' });

    const result = applyTransformOverride([target], {
      id: 'a',
      longitude: 10,
      latitude: 20,
      altitudeM: 3,
      headingDeg: 45,
      pitchDeg: 90,
      rollDeg: 15,
      scale: 2.5,
      minZoom: 12,
    });

    expect(result[0]).toEqual({
      ...target,
      longitude: 10,
      latitude: 20,
      altitudeM: 3,
      headingDeg: 45,
      pitchDeg: 90,
      rollDeg: 15,
      scale: 2.5,
      minZoom: 12,
    });
  });

  it('leaves omitted transform fields unchanged', () => {
    const target = buildObject({
      id: 'a',
      altitudeM: 5,
      headingDeg: 30,
      pitchDeg: 90,
      rollDeg: 10,
      scale: 1.5,
      minZoom: 16,
    });

    const result = applyTransformOverride([target], {
      id: 'a',
      pitchDeg: 45,
      scale: 2,
    });

    expect(result[0]).toEqual({
      ...target,
      pitchDeg: 45,
      scale: 2,
    });
  });

  it('leaves the list unchanged when the override id does not match any object', () => {
    const objects = [buildObject({ id: 'a' })];
    const result = applyTransformOverride(objects, { id: 'missing', longitude: 1, latitude: 2 });
    expect(result).toEqual(objects);
  });

  it('keeps applyPositionOverride as an alias for drag callers', () => {
    const target = buildObject({ id: 'a' });
    const result = applyPositionOverride([target], { id: 'a', longitude: 1, latitude: 2 });
    expect(result[0]?.longitude).toBe(1);
    expect(result[0]?.latitude).toBe(2);
  });
});
