import { describe, expect, it } from 'vitest';

import { GREEN_CANOPY_MAX_VISIBLE } from '@/features/geo-map/trees/constants';
import { pickVisibleTreePoints } from '@/features/geo-map/trees/pick-visible-tree-points';

const center = { longitude: 44.5152, latitude: 40.1872 };

const pointAtMetersEast = (eastM: number) => ({
  longitude: center.longitude + eastM / 85_000,
  latitude: center.latitude,
});

describe('pickVisibleTreePoints', () => {
  it('keeps a near tree', () => {
    const near = pickVisibleTreePoints([pointAtMetersEast(40)]);
    expect(near).toHaveLength(1);
    expect(near[0]?.scale).toBeGreaterThan(0);
  });

  it('does not drop a far tree — zoom only hides the whole layer', () => {
    const far = pickVisibleTreePoints([pointAtMetersEast(800)]);
    expect(far).toHaveLength(1);
  });

  it('hard-caps the visible count with a stable order', () => {
    const crowd = Array.from({ length: GREEN_CANOPY_MAX_VISIBLE + 200 }, (_, index) =>
      pointAtMetersEast(index * 3),
    );
    const first = pickVisibleTreePoints(crowd);
    const second = pickVisibleTreePoints([...crowd].reverse());
    expect(first.length).toBe(GREEN_CANOPY_MAX_VISIBLE);
    expect(first).toEqual(second);
  });
});
