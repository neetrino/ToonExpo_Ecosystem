import { describe, expect, it } from 'vitest';

import { MARKER_CLUSTER_ZOOM_STEP, MAX_MAP_ZOOM } from '@/features/geo-map/constants';
import {
  clusterScreenPoints,
  resolveClusterExpandZoom,
  resolveClusterBubbleTone,
  shouldRenderClusterBubble,
  type ClusterScreenPoint,
} from '@/features/geo-map/utils/cluster-screen-points';

const point = (
  id: string,
  x: number,
  apartmentCount: number,
  y = 0,
  longitude = 44.51 + x / 1_000_000,
  latitude = 40.19 + y / 1_000_000,
): ClusterScreenPoint => ({
  id,
  x,
  y,
  apartmentCount,
  longitude,
  latitude,
});

describe('clusterScreenPoints', () => {
  it('returns no clusters for an empty list', () => {
    expect(clusterScreenPoints([], 56)).toEqual([]);
  });

  it('keeps distant pins as separate one-member clusters', () => {
    const clusters = clusterScreenPoints(
      [point('a', 0, 10, 0, 44.51, 40.19), point('b', 200, 15, 0, 44.65, 40.19)],
      56,
    );
    expect(clusters.map((cluster) => cluster.id)).toEqual(['a', 'b']);
    expect(clusters.map((cluster) => cluster.apartmentCount)).toEqual([10, 15]);
  });

  it('does not merge pins that overlap on screen but sit in different districts', () => {
    const clusters = clusterScreenPoints(
      [point('a', 0, 50, 0, 44.51, 40.19), point('b', 20, 50, 0, 44.62, 40.19)],
      160,
    );
    expect(clusters.map((cluster) => cluster.id)).toEqual(['a', 'b']);
  });

  it('pulls an empty placement into the nearest district even when the icon sits apart', () => {
    const clusters = clusterScreenPoints(
      [point('malatia', 0, 6, 0, 44.44, 40.172), point('empty', 320, 0, 0, 44.4828, 40.1757)],
      56,
    );
    expect(clusters).toHaveLength(1);
    expect(clusters[0]?.apartmentCount).toBe(6);
  });

  it('merges a nearby pin into its district even when the icons do not overlap', () => {
    const clusters = clusterScreenPoints(
      [point('a', 0, 30, 0, 44.51, 40.19), point('b', 120, 9, 0, 44.53, 40.19)],
      160,
    );
    expect(clusters).toHaveLength(1);
    expect(clusters[0]?.apartmentCount).toBe(39);
  });

  it('does not let a chain of close links swallow the next district', () => {
    const clusters = clusterScreenPoints(
      [
        point('a', 0, 14, 0, 44.5, 40.19),
        point('b', 10, 6, 0, 44.52, 40.19),
        point('c', 20, 6, 0, 44.58, 40.19),
      ],
      160,
    );
    expect(clusters.map((cluster) => cluster.apartmentCount)).toEqual([20, 6]);
  });

  it('merges nearby pins and sums published apartments', () => {
    const clusters = clusterScreenPoints([point('a', 0, 30), point('b', 40, 20)], 56);
    expect(clusters).toHaveLength(1);
    expect(clusters[0]).toMatchObject({
      id: 'a|b',
      apartmentCount: 50,
      longitude: 44.51 + 20 / 1_000_000,
      latitude: 40.19,
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
  it('shows a count for every district that has published apartments', () => {
    expect(shouldRenderClusterBubble(2, 50)).toBe(true);
    expect(shouldRenderClusterBubble(1, 6)).toBe(true);
    expect(shouldRenderClusterBubble(1, 0)).toBe(false);
    expect(shouldRenderClusterBubble(2, 0)).toBe(false);
  });
});

describe('resolveClusterBubbleTone', () => {
  it('stays copper below 50, turns green from 50, and returns to copper at 100', () => {
    expect(resolveClusterBubbleTone(49)).toBe('copper');
    expect(resolveClusterBubbleTone(50)).toBe('green');
    expect(resolveClusterBubbleTone(99)).toBe('green');
    expect(resolveClusterBubbleTone(100)).toBe('copper');
  });
});

describe('resolveClusterExpandZoom', () => {
  it('steps the camera in without passing the map maximum', () => {
    expect(resolveClusterExpandZoom(12)).toBe(12 + MARKER_CLUSTER_ZOOM_STEP);
    expect(resolveClusterExpandZoom(MAX_MAP_ZOOM)).toBe(MAX_MAP_ZOOM);
  });
});
