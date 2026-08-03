import { describe, expect, it } from 'vitest';

import { VEHICLE_MAX_COUNT, VEHICLE_SPACING_M } from '@/features/geo-map/traffic/traffic-config';
import type { RoadLine } from '@/features/geo-map/traffic/types';
import {
  createSparseVehicles,
  shouldAnimateVehicles,
  shouldShowVehicles,
} from '@/features/geo-map/traffic/vehicle-sim';
import {
  computeSpawnBudget,
  lineLengthMeters,
  sampleAlongRoad,
} from '@/features/geo-map/traffic/vector-roads';

const makeRoad = (id: string, lengthHint: number): RoadLine => {
  // ~111m per 0.001 deg lat
  const latSpan = lengthHint / 110_540;
  const coords: [number, number][] = [
    [44.5, 40.18],
    [44.5, 40.18 + latSpan],
  ];
  return {
    id,
    coords,
    highway: 'residential',
    lengthM: lineLengthMeters(coords),
  };
};

describe('computeSpawnBudget', () => {
  it('caps by maxVehicles', () => {
    const roads = [makeRoad('a', 2000), makeRoad('b', 2000)];
    expect(computeSpawnBudget(roads, VEHICLE_SPACING_M, 12)).toBe(12);
  });

  it('returns 0 for empty roads', () => {
    expect(computeSpawnBudget([], VEHICLE_SPACING_M, VEHICLE_MAX_COUNT)).toBe(0);
  });
});

describe('createSparseVehicles', () => {
  it('never exceeds the hard cap', () => {
    const roads = Array.from({ length: 20 }, (_, i) => makeRoad(`r${i}`, 400));
    const fleet = createSparseVehicles(roads, 16);
    expect(fleet.length).toBeLessThanOrEqual(16);
    expect(fleet.length).toBeGreaterThan(0);
  });

  it('samples poses along roads', () => {
    const road = makeRoad('main', 200);
    const sample = sampleAlongRoad(road, road.lengthM * 0.5);
    expect(sample.lat).toBeGreaterThan(40.18);
    expect(sample.lat).toBeLessThan(40.18 + 200 / 110_540);
  });
});

describe('visibility gates', () => {
  it('shows at zoom 17+', () => {
    expect(shouldShowVehicles(17, 0)).toBe(true);
  });

  it('shows at high pitch with zoom 16.5+', () => {
    expect(shouldShowVehicles(16.5, 55)).toBe(true);
    expect(shouldShowVehicles(16.4, 55)).toBe(false);
  });

  it('animates only at zoom 17.5+', () => {
    expect(shouldAnimateVehicles(17.4)).toBe(false);
    expect(shouldAnimateVehicles(17.5)).toBe(true);
  });
});
