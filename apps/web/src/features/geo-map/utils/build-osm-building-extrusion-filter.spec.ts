import { describe, expect, it } from 'vitest';

import {
  buildOsmBuildingHideFilter,
  modelToOsmBuildingHideTarget,
} from '@/features/geo-map/utils/build-osm-building-extrusion-filter';
import { encodeFeatureHideId } from '@/features/geo-map/utils/building-hide-identity';

const RADII = { scopeRadiusMeters: 120, fallbackRadiusMeters: 12 };

const distanceClause = (longitude: number, latitude: number, radiusMeters: number) => [
  '<',
  ['distance', { type: 'Point', coordinates: [longitude, latitude] }],
  radiusMeters,
];

describe('modelToOsmBuildingHideTarget', () => {
  it('parses a real osm id', () => {
    expect(
      modelToOsmBuildingHideTarget({ longitude: 44.5, latitude: 40.2, sourceOsmId: '111' }),
    ).toEqual({ longitude: 44.5, latitude: 40.2, osmId: '111', featureId: null });
  });

  it('parses an encoded mvt feature id', () => {
    expect(
      modelToOsmBuildingHideTarget({
        longitude: 44.5,
        latitude: 40.2,
        sourceOsmId: encodeFeatureHideId(42),
      }),
    ).toEqual({ longitude: 44.5, latitude: 40.2, osmId: null, featureId: 42 });
  });

  it('yields no identity for null sourceOsmId', () => {
    expect(
      modelToOsmBuildingHideTarget({ longitude: 44.5, latitude: 40.2, sourceOsmId: null }),
    ).toEqual({ longitude: 44.5, latitude: 40.2, osmId: null, featureId: null });
  });
});

describe('buildOsmBuildingHideFilter', () => {
  it('returns null when there are no targets', () => {
    expect(buildOsmBuildingHideFilter([], RADII)).toBeNull();
  });

  it('scopes a feature-id match to the anchor radius', () => {
    const filter = buildOsmBuildingHideFilter(
      [{ longitude: 44.5, latitude: 40.2, featureId: 42 }],
      RADII,
    );

    expect(filter).toEqual([
      '!',
      [
        'all',
        ['in', ['id'], ['literal', [42, '42']]],
        distanceClause(44.5, 40.2, RADII.scopeRadiusMeters),
      ],
    ]);
  });

  it('scopes an osm-id match to the anchor radius', () => {
    const filter = buildOsmBuildingHideFilter(
      [{ longitude: 44.5, latitude: 40.2, osmId: '111' }],
      RADII,
    );

    expect(filter).toEqual([
      '!',
      [
        'all',
        ['==', ['to-string', ['get', 'osm_id']], '111'],
        distanceClause(44.5, 40.2, RADII.scopeRadiusMeters),
      ],
    ]);
  });

  it('uses a tight distance-only mask for targets without identity', () => {
    const filter = buildOsmBuildingHideFilter([{ longitude: 44.6, latitude: 40.3 }], RADII);

    expect(filter).toEqual(['!', distanceClause(44.6, 40.3, RADII.fallbackRadiusMeters)]);
  });

  it('combines multiple targets with any', () => {
    const filter = buildOsmBuildingHideFilter(
      [
        { longitude: 44.5, latitude: 40.2, osmId: '111' },
        { longitude: 44.6, latitude: 40.3, featureId: 42 },
        { longitude: 44.7, latitude: 40.4 },
      ],
      RADII,
    );

    expect(filter?.[0]).toBe('!');
    const anyClause = filter?.[1] as readonly unknown[];
    expect(anyClause[0]).toBe('any');
    expect(anyClause).toHaveLength(4);
  });

  it('rejects non-positive radii', () => {
    expect(() =>
      buildOsmBuildingHideFilter([{ longitude: 0, latitude: 0 }], {
        scopeRadiusMeters: 0,
        fallbackRadiusMeters: 12,
      }),
    ).toThrow(/radii/);
  });
});
