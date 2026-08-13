import { describe, expect, it } from 'vitest';

import { venueMapOuterEdges } from './venue-map-outer-edges';

describe('venueMapOuterEdges', () => {
  it('returns no edges for an empty cluster', () => {
    expect(venueMapOuterEdges([])).toEqual([]);
  });

  it('outlines a single cell on all four sides', () => {
    expect(venueMapOuterEdges([{ x: 10, y: 20, width: 8, height: 8 }])).toEqual([
      { x1: 10, y1: 20, x2: 18, y2: 20 },
      { x1: 18, y1: 20, x2: 18, y2: 28 },
      { x1: 10, y1: 28, x2: 18, y2: 28 },
      { x1: 10, y1: 20, x2: 10, y2: 28 },
    ]);
  });

  it('drops the shared inner edge between adjacent cells', () => {
    const edges = venueMapOuterEdges([
      { x: 0, y: 0, width: 10, height: 10 },
      { x: 10, y: 0, width: 10, height: 10 },
    ]);
    expect(edges).toHaveLength(6);
    expect(edges).not.toContainEqual({ x1: 10, y1: 0, x2: 10, y2: 10 });
  });
});
