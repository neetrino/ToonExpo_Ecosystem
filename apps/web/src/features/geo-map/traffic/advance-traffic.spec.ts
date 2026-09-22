import { describe, expect, it } from 'vitest';

import { advanceTraffic, mergeTrafficActors } from '@/features/geo-map/traffic/advance-traffic';
import type { RoadPath, TrafficActor } from '@/features/geo-map/traffic/types';

const path: RoadPath = {
  id: 'road-a',
  lengthM: 100,
  points: [
    { longitude: 44.51, latitude: 40.18 },
    { longitude: 44.52, latitude: 40.18 },
  ],
};

describe('advanceTraffic', () => {
  it('moves a car along the road and wraps at the end', () => {
    const actors: TrafficActor[] = [{ id: 'car-1', pathId: 'road-a', distanceM: 90, speedMps: 20 }];
    advanceTraffic(actors, new Map([[path.id, path]]), 1);
    expect(actors[0]?.distanceM).toBeCloseTo(10, 5);
  });

  it('keeps the same car progress after a viewport resync', () => {
    const previous: TrafficActor[] = [
      { id: 'road-a:0', pathId: 'road-a', distanceM: 33, speedMps: 8 },
    ];
    const next: TrafficActor[] = [{ id: 'road-a:0', pathId: 'road-a', distanceM: 8, speedMps: 8 }];
    expect(mergeTrafficActors(previous, next)[0]?.distanceM).toBe(33);
  });
});
