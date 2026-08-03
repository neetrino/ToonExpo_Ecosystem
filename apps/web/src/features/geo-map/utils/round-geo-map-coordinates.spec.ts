import { describe, expect, it } from 'vitest';

import {
  roundGeoMapCoordinateForApi,
  roundGeoMapLngLatForApi,
} from '@/features/geo-map/utils/round-geo-map-coordinates';

describe('roundGeoMapCoordinateForApi', () => {
  it('rounds to 7 decimal places', () => {
    expect(roundGeoMapCoordinateForApi(44.51523456789)).toBe(44.5152346);
    expect(roundGeoMapCoordinateForApi(40.1872123456789)).toBe(40.1872123);
  });
});

describe('roundGeoMapLngLatForApi', () => {
  it('rounds longitude and latitude together', () => {
    expect(
      roundGeoMapLngLatForApi({
        longitude: 44.51523456789,
        latitude: 40.1872123456789,
      }),
    ).toEqual({
      longitude: 44.5152346,
      latitude: 40.1872123,
    });
  });
});
