import { describe, expect, it } from 'vitest';

import type { CityMapModelPose } from '../constants';
import { resolveCityMapRecenterTarget } from './city-map-recenter';

const pose = (
  overrides: Partial<CityMapModelPose> & Pick<CityMapModelPose, 'id'>,
): CityMapModelPose => ({
  projectId: 'p1',
  buildingId: 'b1',
  glbUrl: '',
  longitude: 44.5,
  latitude: 40.2,
  altitude: 0,
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
  scale: 1,
  minZoom: 0,
  label: 'Test',
  ...overrides,
});

describe('resolveCityMapRecenterTarget', () => {
  it('returns Armenia when no placement is selected', () => {
    expect(resolveCityMapRecenterTarget([pose({ id: 'a' })], null)).toEqual({
      kind: 'armenia',
    });
  });

  it('returns pin coordinates for a selected placement', () => {
    const models = [pose({ id: 'a', longitude: 44.1, latitude: 40.1 })];
    expect(resolveCityMapRecenterTarget(models, 'a')).toEqual({
      kind: 'pin',
      longitude: 44.1,
      latitude: 40.1,
    });
  });

  it('falls back to Armenia when selected id is missing from models', () => {
    expect(resolveCityMapRecenterTarget([pose({ id: 'a' })], 'missing')).toEqual({
      kind: 'armenia',
    });
  });
});
