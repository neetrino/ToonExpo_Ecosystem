import { describe, expect, it } from 'vitest';

import {
  buildCombinedOsmBuildingExtrusionFilter,
  buildOsmBuildingExtrusionFilter,
} from '@/features/geo-map/utils/build-osm-building-extrusion-filter';

const RADIUS_METERS = 80;

describe('buildOsmBuildingExtrusionFilter', () => {
  it('returns null when there are no points', () => {
    expect(buildOsmBuildingExtrusionFilter([], RADIUS_METERS)).toBeNull();
  });

  it('builds a single-point distance exclusion filter', () => {
    const filter = buildOsmBuildingExtrusionFilter(
      [{ longitude: 44.5152, latitude: 40.1872 }],
      RADIUS_METERS,
    );

    expect(filter).toEqual([
      '!',
      [
        '<',
        [
          'distance',
          {
            type: 'Point',
            coordinates: [44.5152, 40.1872],
          },
        ],
        RADIUS_METERS,
      ],
    ]);
  });

  it('combines multiple points with any', () => {
    const filter = buildOsmBuildingExtrusionFilter(
      [
        { longitude: 44.5, latitude: 40.2 },
        { longitude: 44.6, latitude: 40.3 },
      ],
      RADIUS_METERS,
    );

    expect(filter?.[0]).toBe('!');
    expect(filter?.[1]?.[0]).toBe('any');
    expect(filter?.[1]).toHaveLength(3);
  });

  it('rejects non-positive radius', () => {
    expect(() => buildOsmBuildingExtrusionFilter([{ longitude: 0, latitude: 0 }], 0)).toThrow(
      /radiusMeters/,
    );
  });
});

describe('buildCombinedOsmBuildingExtrusionFilter', () => {
  it('merges distance and osm_id exclusions', () => {
    const filter = buildCombinedOsmBuildingExtrusionFilter(
      [
        { longitude: 44.5, latitude: 40.2, sourceOsmId: '111' },
        { longitude: 44.6, latitude: 40.3, sourceOsmId: null },
      ],
      RADIUS_METERS,
    );

    expect(filter?.[0]).toBe('all');
    expect(filter).toHaveLength(3);
  });

  it('returns null when there are no models and no extras', () => {
    expect(buildCombinedOsmBuildingExtrusionFilter([], RADIUS_METERS)).toBeNull();
  });

  it('merges admin session osm_id and distance hides', () => {
    const filter = buildCombinedOsmBuildingExtrusionFilter([], RADIUS_METERS, {
      hiddenOsmIds: ['999'],
      hiddenDistancePoints: [{ longitude: 44.51, latitude: 40.18 }],
    });

    expect(filter?.[0]).toBe('all');
    expect(filter).toHaveLength(3);
  });
});
