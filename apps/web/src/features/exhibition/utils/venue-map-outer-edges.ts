import type { PublicVenueMapCellRect } from '@toonexpo/contracts';

export type VenueMapEdge = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

const cellKey = (col: number, row: number): string => `${col}:${row}`;

const occupiedCellKeys = (
  rects: readonly PublicVenueMapCellRect[],
  cellWidth: number,
  cellHeight: number,
  originX: number,
  originY: number,
): Set<string> => {
  const toCol = (x: number) => Math.round((x - originX) / cellWidth);
  const toRow = (y: number) => Math.round((y - originY) / cellHeight);
  return new Set(rects.map((rect) => cellKey(toCol(rect.x), toRow(rect.y))));
};

/**
 * Outer edges of a cell cluster. Shared inner sides are omitted so the
 * public map shows one booth outline instead of a grid of squares.
 */
export const venueMapOuterEdges = (
  rects: readonly PublicVenueMapCellRect[],
): VenueMapEdge[] => {
  const first = rects[0];
  if (!first || first.width <= 0 || first.height <= 0) {
    return [];
  }
  const { width: cellWidth, height: cellHeight } = first;
  const originX = Math.min(...rects.map((rect) => rect.x));
  const originY = Math.min(...rects.map((rect) => rect.y));
  const occupied = occupiedCellKeys(rects, cellWidth, cellHeight, originX, originY);
  const toCol = (x: number) => Math.round((x - originX) / cellWidth);
  const toRow = (y: number) => Math.round((y - originY) / cellHeight);

  return rects.flatMap((rect) => {
    const col = toCol(rect.x);
    const row = toRow(rect.y);
    const { x, y, width, height } = rect;
    const edges: VenueMapEdge[] = [];
    if (!occupied.has(cellKey(col, row - 1))) {
      edges.push({ x1: x, y1: y, x2: x + width, y2: y });
    }
    if (!occupied.has(cellKey(col + 1, row))) {
      edges.push({ x1: x + width, y1: y, x2: x + width, y2: y + height });
    }
    if (!occupied.has(cellKey(col, row + 1))) {
      edges.push({ x1: x, y1: y + height, x2: x + width, y2: y + height });
    }
    if (!occupied.has(cellKey(col - 1, row))) {
      edges.push({ x1: x, y1: y, x2: x, y2: y + height });
    }
    return edges;
  });
};
