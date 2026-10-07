import { describe, expect, it } from 'vitest';

import { MARKER_CLUSTER_ZOOM_STEP, MAX_MAP_ZOOM } from '@/features/geo-map/constants';
import {
  clusterScreenPoints,
  resolveClusterExpandZoom,
  shouldRenderClusterBubble,
  type ClusterScreenPoint,
} from '@/features/geo-map/utils/cluster-screen-points';

const point = (id: string, x: number, apartmentCount: number, y = 0): ClusterScreenPoint => ({
  id,
  x,
  y,
  apartmentCount,
  longitude: x / 1000,
  latitude: y / 1000,
});

describe('clusterScreenPoints', () => {
  it('returns no clusters for an empty list', () => {
    expect(clusterScreenPoints([], 56)).toEqual([]);
  });

  it('keeps distant pins as separate one-member clusters', () => {
    const clusters = clusterScreenPoints([point('a', 0, 10), point('b', 200, 15)], 56);
    expect(clusters.map((cluster) => cluster.id)).toEqual(['a', 'b']);
    expect(clusters.map((cluster) => cluster.apartmentCount)).toEqual([10, 15]);
  });

  it('merges nearby pins and sums published apartments', () => {
    const clusters = clusterScreenPoints([point('a', 0, 30), point('b', 40, 20)], 56);
    expect(clusters).toHaveLength(1);
    expect(clusters[0]).toMatchObject({
      id: 'a|b',
      apartmentCount: 50,
      longitude: (0 + 40) / 2 / 1000,
      latitude: 0,
    });
  });

  it('merges a chain of overlapping pins into one bubble', () => {
    const clusters = clusterScreenPoints(
      [point('a', 0, 10), point('b', 40, 10), point('c', 80, 5)],
      50,
    );
    expect(clusters).toHaveLength(1);
    expect(clusters[0]?.apartmentCount).toBe(25);
    expect(clusters[0]?.members.map((member) => member.id)).toEqual(['a', 'b', 'c']);
  });

  it('does not depend on input order', () => {
    const forward = clusterScreenPoints([point('b', 10, 4), point('a', 0, 6)], 56);
    const reverse = clusterScreenPoints([point('a', 0, 6), point('b', 10, 4)], 56);
    expect(forward).toEqual(reverse);
  });

  it('leaves every pin alone when the radius is zero', () => {
    const clusters = clusterScreenPoints([point('a', 0, 1), point('b', 1, 1)], 0);
    expect(clusters.map((cluster) => cluster.id)).toEqual(['a', 'b']);
  });
});

describe('shouldRenderClusterBubble', () => {
  it('shows a bubble only when several pins share published apartments', () => {
    expect(shouldRenderClusterBubble(2, 50)).toBe(true);
    expect(shouldRenderClusterBubble(1, 50)).toBe(false);
    expect(shouldRenderClusterBubble(2, 0)).toBe(false);
  });
});

describe('resolveClusterExpandZoom', () => {
  it('steps the camera in without passing the map maximum', () => {
    expect(resolveClusterExpandZoom(12)).toBe(12 + MARKER_CLUSTER_ZOOM_STEP);
    expect(resolveClusterExpandZoom(MAX_MAP_ZOOM)).toBe(MAX_MAP_ZOOM);
  });
});
