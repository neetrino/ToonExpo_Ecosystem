export type VenueMapCell = {
  x: number;
  y: number;
};

export type VenueMapCellRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type VenueMapCalibration = {
  pixelsPerMeter: number;
  gridOriginX: number;
  gridOriginY: number;
};

export const isVenueMapCellGeometry = (
  value: unknown,
): value is { type: "cells"; cells: VenueMapCell[] } => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const record = value as { type?: unknown; cells?: unknown };
  if (record.type !== "cells" || !Array.isArray(record.cells)) {
    return false;
  }
  return record.cells.every(isVenueMapCell);
};

const isVenueMapCell = (value: unknown): value is VenueMapCell => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const record = value as { x?: unknown; y?: unknown };
  return Number.isInteger(record.x) && Number.isInteger(record.y);
};

export const cellToRect = (
  cell: VenueMapCell,
  calibration: VenueMapCalibration,
): VenueMapCellRect => ({
  x: calibration.gridOriginX + cell.x * calibration.pixelsPerMeter,
  y: calibration.gridOriginY + cell.y * calibration.pixelsPerMeter,
  width: calibration.pixelsPerMeter,
  height: calibration.pixelsPerMeter,
});

export const cellsToRects = (
  cells: readonly VenueMapCell[],
  calibration: VenueMapCalibration,
): VenueMapCellRect[] => cells.map((cell) => cellToRect(cell, calibration));

export const rectsCentroid = (
  rects: readonly VenueMapCellRect[],
): { x: number; y: number } => {
  if (rects.length === 0) {
    return { x: 0, y: 0 };
  }
  const totals = rects.reduce(
    (acc, rect) => ({
      x: acc.x + rect.x + rect.width / 2,
      y: acc.y + rect.y + rect.height / 2,
    }),
    { x: 0, y: 0 },
  );
  return {
    x: totals.x / rects.length,
    y: totals.y / rects.length,
  };
};
