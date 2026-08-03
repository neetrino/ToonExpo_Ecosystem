import { describe, expect, it } from 'vitest';

import {
  computeFootprintCenter,
  extractSiblingPolygons,
  narrowBuildingGeometryToClick,
  resolveSourceOsmId,
} from '@/features/geo-map/utils/building-identification';

describe('resolveSourceOsmId', () => {
  it('reads osm_id from properties', () => {
    expect(resolveSourceOsmId({ osm_id: 582962758 })).toBe('582962758');
  });

  it('strips OSM type prefixes', () => {
    expect(resolveSourceOsmId({ '@id': 'way/123' })).toBe('123');
  });

  it('returns null when missing', () => {
    expect(resolveSourceOsmId({})).toBeNull();
    expect(resolveSourceOsmId(null)).toBeNull();
  });
});

describe('computeFootprintCenter', () => {
  it('computes a polygon centroid', () => {
    const [lng, lat] = computeFootprintCenter({
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [4, 0],
          [4, 4],
          [0, 4],
          [0, 0],
        ],
      ],
    });
    expect(lng).toBeCloseTo(2, 5);
    expect(lat).toBeCloseTo(2, 5);
  });
});

describe('narrowBuildingGeometryToClick', () => {
  const westSquare: number[][] = [
    [0, 0],
    [2, 0],
    [2, 2],
    [0, 2],
    [0, 0],
  ];
  const eastSquare: number[][] = [
    [10, 0],
    [12, 0],
    [12, 2],
    [10, 2],
    [10, 0],
  ];

  it('returns only the MultiPolygon part containing the click', () => {
    const narrowed = narrowBuildingGeometryToClick(
      { longitude: 11, latitude: 1 },
      {
        type: 'MultiPolygon',
        coordinates: [[westSquare], [eastSquare]],
      },
    );
    expect(narrowed.type).toBe('Polygon');
    expect(narrowed.coordinates[0]?.[0]?.[0]).toBe(10);
  });

  it('falls back to the nearest polygon when the click is outside all parts', () => {
    const narrowed = narrowBuildingGeometryToClick(
      { longitude: 9, latitude: 1 },
      {
        type: 'MultiPolygon',
        coordinates: [[westSquare], [eastSquare]],
      },
    );
    expect(narrowed.type).toBe('Polygon');
    expect(narrowed.coordinates[0]?.[0]?.[0]).toBe(10);
  });

  it('keeps a single Polygon when the click is inside', () => {
    const polygon = {
      type: 'Polygon' as const,
      coordinates: [westSquare],
    };
    expect(narrowBuildingGeometryToClick({ longitude: 1, latitude: 1 }, polygon)).toEqual(polygon);
  });
});

describe('extractSiblingPolygons', () => {
  const westSquare: number[][] = [
    [0, 0],
    [2, 0],
    [2, 2],
    [0, 2],
    [0, 0],
  ];
  const eastSquare: number[][] = [
    [10, 0],
    [12, 0],
    [12, 2],
    [10, 2],
    [10, 0],
  ];

  it('returns the other MultiPolygon rings', () => {
    const kept = { type: 'Polygon' as const, coordinates: [eastSquare] };
    const siblings = extractSiblingPolygons(
      {
        type: 'MultiPolygon',
        coordinates: [[westSquare], [eastSquare]],
      },
      kept,
    );
    expect(siblings).toHaveLength(1);
    expect(siblings[0]?.coordinates[0]?.[0]?.[0]).toBe(0);
  });

  it('returns empty for a single Polygon', () => {
    const polygon = { type: 'Polygon' as const, coordinates: [westSquare] };
    expect(extractSiblingPolygons(polygon, polygon)).toEqual([]);
  });
});
