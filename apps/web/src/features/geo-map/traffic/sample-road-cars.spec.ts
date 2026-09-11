import { describe, expect, it } from 'vitest';

import { sampleRoadCars } from '@/features/geo-map/traffic/sample-road-cars';

const road = [
  { longitude: 44.51, latitude: 40.18 },
  { longitude: 44.52, latitude: 40.18 },
];

const clip = { west: 44.505, south: 40.175, east: 44.525, north: 40.185 };

describe('sampleRoadCars', () => {
  it('places a few cars on a visible road, not a dense pack', () => {
    const { actors } = sampleRoadCars([road], clip, 120);
    expect(actors.length).toBeGreaterThan(0);
    expect(actors.length).toBeLessThan(12);
  });

  it('is deterministic for the same road and clip', () => {
    expect(sampleRoadCars([road], clip, 120)).toEqual(sampleRoadCars([road], clip, 120));
  });

  it('keeps the same car slots in an overlapping smaller window', () => {
    const wide = sampleRoadCars([road], clip, 80);
    const inner = { west: 44.513, south: 40.175, east: 44.518, north: 40.185 };
    const narrow = sampleRoadCars([road], inner, 80);
    const wideIds = new Set(wide.actors.map((actor) => actor.id));
    expect(narrow.actors.length).toBeGreaterThan(0);
    expect(narrow.actors.every((actor) => wideIds.has(actor.id))).toBe(true);
  });

  it('returns nothing when the clip misses the road', () => {
    expect(sampleRoadCars([road], { west: 45, south: 41, east: 46, north: 42 }, 80).actors).toEqual(
      [],
    );
  });
});
