import { describe, expect, it } from 'vitest';

import {
  computeBoothRoute,
  findRoutePath,
  resolveBoothDestinationNodeId,
  type RouteGraph,
} from './route-path';

const graph: RouteGraph = {
  nodes: [
    { id: 'e', xPercent: 50, yPercent: 95, kind: 'ENTRANCE', boothId: null },
    { id: 'w1', xPercent: 50, yPercent: 70, kind: 'WAYPOINT', boothId: null },
    { id: 'w2', xPercent: 50, yPercent: 50, kind: 'WAYPOINT', boothId: null },
    { id: 'wa', xPercent: 28, yPercent: 50, kind: 'WAYPOINT', boothId: null },
    { id: 'a12', xPercent: 28, yPercent: 42, kind: 'BOOTH', boothId: 'booth-a12' },
    { id: 'b03', xPercent: 55, yPercent: 35, kind: 'BOOTH', boothId: 'booth-b03' },
  ],
  edges: [
    { fromNodeId: 'e', toNodeId: 'w1' },
    { fromNodeId: 'w1', toNodeId: 'w2' },
    { fromNodeId: 'w2', toNodeId: 'wa' },
    { fromNodeId: 'wa', toNodeId: 'a12' },
    { fromNodeId: 'w2', toNodeId: 'b03' },
  ],
};

describe('findRoutePath', () => {
  it('returns BFS path points from entrance to booth', () => {
    const path = findRoutePath(graph, 'e', 'a12');
    expect(path).toEqual([
      { xPercent: 50, yPercent: 95 },
      { xPercent: 50, yPercent: 70 },
      { xPercent: 50, yPercent: 50 },
      { xPercent: 28, yPercent: 50 },
      { xPercent: 28, yPercent: 42 },
    ]);
  });

  it('treats edges as bidirectional', () => {
    const path = findRoutePath(graph, 'a12', 'e');
    expect(path?.at(0)).toEqual({ xPercent: 28, yPercent: 42 });
    expect(path?.at(-1)).toEqual({ xPercent: 50, yPercent: 95 });
  });

  it('returns null when unreachable', () => {
    const disconnected: RouteGraph = {
      nodes: [
        { id: 'a', xPercent: 0, yPercent: 0, kind: 'ENTRANCE', boothId: null },
        { id: 'b', xPercent: 10, yPercent: 10, kind: 'BOOTH', boothId: 'x' },
      ],
      edges: [],
    };
    expect(findRoutePath(disconnected, 'a', 'b')).toBeNull();
  });

  it('returns single point when start equals end', () => {
    expect(findRoutePath(graph, 'e', 'e')).toEqual([{ xPercent: 50, yPercent: 95 }]);
  });
});

describe('resolveBoothDestinationNodeId', () => {
  it('prefers explicit boothId link', () => {
    expect(
      resolveBoothDestinationNodeId({ id: 'booth-a12', xPercent: 99, yPercent: 99 }, graph.nodes),
    ).toBe('a12');
  });

  it('falls back to nearest node within epsilon', () => {
    expect(
      resolveBoothDestinationNodeId({ id: 'unknown', xPercent: 28.5, yPercent: 42.5 }, graph.nodes),
    ).toBe('a12');
  });
});

describe('computeBoothRoute', () => {
  it('routes from entrance coords via ENTRANCE node', () => {
    const path = computeBoothRoute(
      graph,
      { id: 'booth-b03', xPercent: 55, yPercent: 35 },
      { xPercent: 50, yPercent: 95 },
    );
    expect(path?.at(0)).toEqual({ xPercent: 50, yPercent: 95 });
    expect(path?.at(-1)).toEqual({ xPercent: 55, yPercent: 35 });
  });

  it('returns null without entrance node or coords', () => {
    const noEntrance: RouteGraph = {
      nodes: graph.nodes.filter((node) => node.kind !== 'ENTRANCE'),
      edges: graph.edges,
    };
    expect(
      computeBoothRoute(noEntrance, { id: 'booth-a12', xPercent: 28, yPercent: 42 }, null),
    ).toBeNull();
  });
});
