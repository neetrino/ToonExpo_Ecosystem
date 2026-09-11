import {
  DEG_TO_RAD,
  GREEN_CANOPY_MIN_SPACING_M,
  GREEN_CANOPY_NEAR_SPACING_M,
  GREEN_CANOPY_RAW_SAMPLE_CAP,
  METERS_PER_DEG_LAT,
} from '@/features/geo-map/trees/constants';
import {
  canopyCellPoint,
  canopyGridCol,
  canopyGridRow,
  canopyGridStepLat,
  canopyGridStepLng,
  snapToCanopyGrid,
} from '@/features/geo-map/trees/canopy-world-grid';
import { isPointInRing } from '@/features/geo-map/trees/is-point-in-ring';
import type { GreenLngLat, GreenSampleBounds, LngLatRing } from '@/features/geo-map/trees/types';

const ringBBox = (ring: LngLatRing): GreenSampleBounds | null => {
  let west = Infinity;
  let south = Infinity;
  let east = -Infinity;
  let north = -Infinity;
  for (const pair of ring) {
    west = Math.min(west, pair[0]);
    east = Math.max(east, pair[0]);
    south = Math.min(south, pair[1]);
    north = Math.max(north, pair[1]);
  }
  if (!Number.isFinite(west)) {
    return null;
  }
  return { west, south, east, north };
};

const clipBBox = (bbox: GreenSampleBounds, clip: GreenSampleBounds): GreenSampleBounds | null => {
  const west = Math.max(bbox.west, clip.west);
  const south = Math.max(bbox.south, clip.south);
  const east = Math.min(bbox.east, clip.east);
  const north = Math.min(bbox.north, clip.north);
  if (west >= east || south >= north) {
    return null;
  }
  return { west, south, east, north };
};

const padBounds = (bbox: GreenSampleBounds, spacingM: number): GreenSampleBounds => {
  const midLat = (bbox.south + bbox.north) / 2;
  const padLat = canopyGridStepLat(spacingM);
  const padLng = canopyGridStepLng(spacingM, midLat);
  return {
    west: bbox.west - padLng,
    south: bbox.south - padLat,
    east: bbox.east + padLng,
    north: bbox.north + padLat,
  };
};

const pushGridPoints = (
  ring: LngLatRing,
  bbox: GreenSampleBounds,
  spacingM: number,
  points: GreenLngLat[],
  maxPoints: number,
): void => {
  const stepLat = canopyGridStepLat(spacingM);
  const firstRow = canopyGridRow(bbox.south, stepLat);
  const lastRow = canopyGridRow(bbox.north, stepLat);
  for (let row = firstRow; row <= lastRow && points.length < maxPoints; row += 1) {
    const rowLat = (row + 0.5) * stepLat;
    const stepLng = canopyGridStepLng(spacingM, rowLat);
    const firstCol = canopyGridCol(bbox.west, stepLng, row);
    const lastCol = canopyGridCol(bbox.east, stepLng, row);
    for (let col = firstCol; col <= lastCol; col += 1) {
      if (points.length >= maxPoints) {
        return;
      }
      const candidate = canopyCellPoint(row, col, spacingM);
      if (isPointInRing(candidate, ring)) {
        points.push(candidate);
      }
    }
  }
};

const sampleRing = (
  ring: LngLatRing,
  spacingM: number,
  clip: GreenSampleBounds,
  points: GreenLngLat[],
  maxPoints: number,
): void => {
  const rawBBox = ringBBox(ring);
  if (!rawBBox) {
    return;
  }
  const bbox = clipBBox(rawBBox, clip);
  if (!bbox) {
    return;
  }
  const midLat = (bbox.south + bbox.north) / 2;
  const metersPerDegLng = METERS_PER_DEG_LAT * Math.max(Math.cos(midLat * DEG_TO_RAD), 0.2);
  const widthM = (bbox.east - bbox.west) * metersPerDegLng;
  const heightM = (bbox.north - bbox.south) * METERS_PER_DEG_LAT;
  if (widthM < spacingM && heightM < spacingM) {
    const cell = snapToCanopyGrid(
      { longitude: (bbox.west + bbox.east) / 2, latitude: (bbox.south + bbox.north) / 2 },
      spacingM,
    );
    if (isPointInRing(cell, ring) && points.length < maxPoints) {
      points.push(cell);
    }
    return;
  }
  pushGridPoints(ring, padBounds(bbox, spacingM), spacingM, points, maxPoints);
};

/**
 * World-aligned park samples. The same cell is always the same tree,
 * regardless of the current zoom window.
 */
export const sampleGreenTreePoints = (
  rings: readonly LngLatRing[],
  clip: GreenSampleBounds,
  spacingM: number = GREEN_CANOPY_NEAR_SPACING_M,
): GreenLngLat[] => {
  const step = Math.max(GREEN_CANOPY_MIN_SPACING_M, spacingM);
  const points: GreenLngLat[] = [];
  for (const ring of rings) {
    sampleRing(ring, step, clip, points, GREEN_CANOPY_RAW_SAMPLE_CAP);
    if (points.length >= GREEN_CANOPY_RAW_SAMPLE_CAP) {
      break;
    }
  }
  return points;
};
