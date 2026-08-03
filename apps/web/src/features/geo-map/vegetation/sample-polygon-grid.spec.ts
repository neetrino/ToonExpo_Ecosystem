import { describe, expect, it } from 'vitest';

import { samplePolygonGrid } from '@/features/geo-map/vegetation/sample-polygon-grid';
import { polygonAreaM2, ringCentroid } from '@/features/geo-map/vegetation/polygon-geometry';
import {
  createSeededRandom,
  pickWeightedSpecies,
} from '@/features/geo-map/vegetation/deterministic-random';
import { generateTreesForPark } from '@/features/geo-map/vegetation/build-tree-layout';
import type { ParkFeatureRecord } from '@/features/geo-map/vegetation/types';
import {
  DEFAULT_VEGETATION_CONFIG,
  VEGETATION_QUALITY,
} from '@/features/geo-map/vegetation/vegetation-config';

const unitSquare: [number, number][] = [
  [44.5, 40.18],
  [44.501, 40.18],
  [44.501, 40.181],
  [44.5, 40.181],
  [44.5, 40.18],
];

describe('polygon geometry', () => {
  it('computes a positive area for a closed ring', () => {
    expect(polygonAreaM2(unitSquare)).toBeGreaterThan(1000);
  });

  it('returns ring centroid inside the square', () => {
    const [lng, lat] = ringCentroid(unitSquare);
    expect(lng).toBeGreaterThan(44.5);
    expect(lng).toBeLessThan(44.501);
    expect(lat).toBeGreaterThan(40.18);
    expect(lat).toBeLessThan(40.181);
  });
});

describe('samplePolygonGrid', () => {
  it('is deterministic for the same seed', () => {
    const opts = {
      ring: unitSquare,
      spacingM: 12,
      edgePaddingM: 0.5,
      maxPoints: 20,
      seed: 'grid-test',
    };
    const a = samplePolygonGrid(opts);
    const b = samplePolygonGrid(opts);
    expect(a.points).toEqual(b.points);
    expect(a.points.length).toBeGreaterThan(0);
    expect(a.points.length).toBeLessThanOrEqual(20);
  });
});

describe('deterministic random', () => {
  it('picks weighted species stably', () => {
    const rand = createSeededRandom('species');
    const picks = Array.from({ length: 20 }, () =>
      pickWeightedSpecies(rand, { deciduous: 1, compact: 0, conifer: 0 }),
    );
    expect(picks.every((p) => p === 'deciduous')).toBe(true);
  });
});

describe('generateTreesForPark', () => {
  it('respects remaining cap and is deterministic', () => {
    const park: ParkFeatureRecord = {
      id: 'test:park:1',
      source: 'test',
      sourceLayer: 'park',
      geometry: { type: 'Polygon', coordinates: [unitSquare] },
      properties: { class: 'park' },
      areaM2: polygonAreaM2(unitSquare),
      centroid: ringCentroid(unitSquare),
    };
    const exclusions = { buildingRings: [], waterRings: [], version: '0' };
    const a = generateTreesForPark(
      park,
      DEFAULT_VEGETATION_CONFIG,
      VEGETATION_QUALITY.medium,
      exclusions,
      park.centroid,
      12,
    );
    const b = generateTreesForPark(
      park,
      DEFAULT_VEGETATION_CONFIG,
      VEGETATION_QUALITY.medium,
      exclusions,
      park.centroid,
      12,
    );
    expect(a.instances.length).toBeLessThanOrEqual(12);
    expect(a.instances).toEqual(b.instances);
  });
});
