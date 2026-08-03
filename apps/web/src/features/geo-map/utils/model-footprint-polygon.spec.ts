import { describe, expect, it } from 'vitest';

import {
  buildCirclePolygonRing,
  EARTH_RADIUS_METERS,
  metersToLatitudeDegrees,
  offsetLngLatMeters,
} from '@/features/geo-map/utils/model-footprint-polygon';

const YEREVAN_LNG = 44.5152;
const YEREVAN_LAT = 40.1872;
const RADIUS_METERS = 30;
const SEGMENT_COUNT = 16;

describe('offsetLngLatMeters', () => {
  it('moves north by approximately the expected latitude degrees', () => {
    const offset = offsetLngLatMeters(YEREVAN_LNG, YEREVAN_LAT, 0, RADIUS_METERS);
    expect(offset.longitude).toBeCloseTo(YEREVAN_LNG, 7);
    expect(offset.latitude).toBeCloseTo(YEREVAN_LAT + metersToLatitudeDegrees(RADIUS_METERS), 6);
  });

  it('moves east without changing latitude', () => {
    const offset = offsetLngLatMeters(YEREVAN_LNG, YEREVAN_LAT, RADIUS_METERS, 0);
    expect(offset.latitude).toBeCloseTo(YEREVAN_LAT, 7);
    expect(offset.longitude).toBeGreaterThan(YEREVAN_LNG);
  });
});

describe('buildCirclePolygonRing', () => {
  it('returns a closed ring with segmentCount + 1 vertices', () => {
    const ring = buildCirclePolygonRing(YEREVAN_LNG, YEREVAN_LAT, RADIUS_METERS, SEGMENT_COUNT);
    expect(ring).toHaveLength(SEGMENT_COUNT + 1);
    expect(ring[0]).toEqual(ring[SEGMENT_COUNT]);
  });

  it('keeps all vertices near the requested radius', () => {
    const ring = buildCirclePolygonRing(YEREVAN_LNG, YEREVAN_LAT, RADIUS_METERS, SEGMENT_COUNT);
    const metersPerDegreeLat = (EARTH_RADIUS_METERS * Math.PI) / 180;
    const metersPerDegreeLng = metersPerDegreeLat * Math.cos((YEREVAN_LAT * Math.PI) / 180);

    for (let index = 0; index < SEGMENT_COUNT; index += 1) {
      const point = ring[index];
      expect(point).toBeDefined();
      const eastMeters = (point![0] - YEREVAN_LNG) * metersPerDegreeLng;
      const northMeters = (point![1] - YEREVAN_LAT) * metersPerDegreeLat;
      const distance = Math.hypot(eastMeters, northMeters);
      expect(distance).toBeCloseTo(RADIUS_METERS, 1);
    }
  });

  it('rejects invalid segmentCount and radius', () => {
    expect(() => buildCirclePolygonRing(0, 0, RADIUS_METERS, 2)).toThrow(/segmentCount/);
    expect(() => buildCirclePolygonRing(0, 0, 0, SEGMENT_COUNT)).toThrow(/radiusMeters/);
  });
});
