import { DEG_TO_RAD, METERS_PER_DEG_LAT } from '@/features/geo-map/trees/constants';
import { greenHashUnit } from '@/features/geo-map/trees/green-hash';
import type { GreenLngLat } from '@/features/geo-map/trees/types';

export const canopyGridStepLat = (spacingM: number): number => spacingM / METERS_PER_DEG_LAT;

export const canopyGridStepLng = (spacingM: number, latitude: number): number =>
  spacingM / (METERS_PER_DEG_LAT * Math.max(Math.cos(latitude * DEG_TO_RAD), 0.2));

/** World row for a latitude — same park cell is always the same row. */
export const canopyGridRow = (latitude: number, stepLat: number): number =>
  Math.floor(latitude / stepLat);

export const canopyGridCol = (longitude: number, stepLng: number, row: number): number => {
  const rowShift = row % 2 === 0 ? 0 : stepLng * 0.5;
  return Math.floor((longitude - rowShift) / stepLng);
};

export const snapToCanopyGrid = (point: GreenLngLat, spacingM: number): GreenLngLat => {
  const stepLat = canopyGridStepLat(spacingM);
  const row = canopyGridRow(point.latitude, stepLat);
  const stepLng = canopyGridStepLng(spacingM, (row + 0.5) * stepLat);
  return canopyCellPoint(row, canopyGridCol(point.longitude, stepLng, row), spacingM);
};

/** Snapped + lightly jittered park cell. Seed is the cell index, not the clip window. */
export const canopyCellPoint = (row: number, col: number, spacingM: number): GreenLngLat => {
  const stepLat = canopyGridStepLat(spacingM);
  const latitude = (row + 0.5) * stepLat;
  const stepLng = canopyGridStepLng(spacingM, latitude);
  const rowShift = row % 2 === 0 ? 0 : stepLng * 0.5;
  const longitude = col * stepLng + rowShift + stepLng * 0.5;
  const seed = `${row}:${col}`;
  return {
    longitude: longitude + (greenHashUnit(`${seed}:lng`) - 0.5) * 2 * stepLng * 0.08,
    latitude: latitude + (greenHashUnit(`${seed}:lat`) - 0.5) * 2 * stepLat * 0.08,
  };
};
