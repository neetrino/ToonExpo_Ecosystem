import { describe, expect, it } from "vitest";

import {
  cellsToRects,
  isVenueMapCellGeometry,
  rectsCentroid,
} from "./public-venue-map.geometry.js";

describe("public venue map geometry", () => {
  it("accepts stored cell geometry and rejects other shapes", () => {
    expect(
      isVenueMapCellGeometry({ type: "cells", cells: [{ x: 1, y: 2 }] }),
    ).toBe(true);
    expect(isVenueMapCellGeometry({ type: "polygon", cells: [] })).toBe(false);
    expect(isVenueMapCellGeometry(null)).toBe(false);
  });

  it("maps BOS cells to pixel rects using 1 cell = 1 meter", () => {
    const rects = cellsToRects(
      [{ x: 2, y: 1 }],
      { pixelsPerMeter: 10, gridOriginX: 5, gridOriginY: 8 },
    );
    expect(rects).toEqual([{ x: 25, y: 18, width: 10, height: 10 }]);
  });

  it("computes the centroid of cell rects", () => {
    const center = rectsCentroid([
      { x: 0, y: 0, width: 10, height: 10 },
      { x: 10, y: 0, width: 10, height: 10 },
    ]);
    expect(center).toEqual({ x: 10, y: 5 });
  });
});
