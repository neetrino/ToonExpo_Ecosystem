import { describe, expect, it } from 'vitest';

import {
  buildModelFootprintGeoJson,
  EMPTY_MODEL_FOOTPRINT_GEOJSON,
} from '@/features/geo-map/utils/build-model-footprint-geojson';

const SEGMENT_COUNT = 12;
const RADIUS_METERS = 30;

describe('buildModelFootprintGeoJson', () => {
  it('returns an empty FeatureCollection for no objects', () => {
    expect(buildModelFootprintGeoJson([], RADIUS_METERS, SEGMENT_COUNT)).toEqual(
      EMPTY_MODEL_FOOTPRINT_GEOJSON,
    );
  });

  it('builds one polygon feature per object', () => {
    const geojson = buildModelFootprintGeoJson(
      [
        { id: 'a', longitude: 44.5, latitude: 40.2 },
        { id: 'b', longitude: 44.6, latitude: 40.3 },
      ],
      RADIUS_METERS,
      SEGMENT_COUNT,
    );

    expect(geojson.type).toBe('FeatureCollection');
    expect(geojson.features).toHaveLength(2);
    expect(geojson.features[0]?.id).toBe('a');
    expect(geojson.features[0]?.geometry.type).toBe('Polygon');
    expect(geojson.features[0]?.geometry.coordinates[0]).toHaveLength(SEGMENT_COUNT + 1);
    expect(geojson.features[1]?.properties?.['objectId']).toBe('b');
  });
});
