import type { PublicVenueMapCellRect } from '@toonexpo/contracts';

import { venueMapOuterEdges } from '@/features/exhibition/utils/venue-map-outer-edges';

const POINT_KEY_SCALE = 1_000;
const COORD_DECIMALS = 100;

type OutlineSegment = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  used: boolean;
};

const pointKey = (x: number, y: number): string =>
  `${Math.round(x * POINT_KEY_SCALE)}:${Math.round(y * POINT_KEY_SCALE)}`;

const samePoint = (ax: number, ay: number, bx: number, by: number): boolean =>
  pointKey(ax, ay) === pointKey(bx, by);

const formatCoord = (value: number): string =>
  String(Math.round(value * COORD_DECIMALS) / COORD_DECIMALS);

const otherEnd = (segment: OutlineSegment, x: number, y: number): { x: number; y: number } => {
  if (samePoint(segment.x1, segment.y1, x, y)) {
    return { x: segment.x2, y: segment.y2 };
  }
  return { x: segment.x1, y: segment.y1 };
};

const indexSegments = (segments: OutlineSegment[]): Map<string, number[]> => {
  const index = new Map<string, number[]>();
  segments.forEach((segment, segmentIndex) => {
    for (const key of [pointKey(segment.x1, segment.y1), pointKey(segment.x2, segment.y2)]) {
      const list = index.get(key);
      if (list) {
        list.push(segmentIndex);
      } else {
        index.set(key, [segmentIndex]);
      }
    }
  });
  return index;
};

const traceLoop = (
  segments: OutlineSegment[],
  index: Map<string, number[]>,
  startIndex: number,
): string => {
  const start = segments[startIndex];
  if (!start) {
    return '';
  }
  let x = start.x1;
  let y = start.y1;
  const commands = [`M ${formatCoord(x)} ${formatCoord(y)}`];

  for (let step = 0; step <= segments.length; step += 1) {
    const nextIndex = (index.get(pointKey(x, y)) ?? []).find(
      (candidate) => !segments[candidate]?.used,
    );
    const segment = nextIndex === undefined ? undefined : segments[nextIndex];
    if (!segment) {
      break;
    }
    segment.used = true;
    const next = otherEnd(segment, x, y);
    x = next.x;
    y = next.y;
    commands.push(`L ${formatCoord(x)} ${formatCoord(y)}`);
    if (samePoint(x, y, start.x1, start.y1)) {
      break;
    }
  }

  commands.push('Z');
  return commands.join(' ');
};

/**
 * One even-odd SVG path for a cell cluster. Shared inner edges are omitted,
 * so a booth is a single shape instead of one rectangle per cell.
 */
export const rectsToOutlinePath = (rects: readonly PublicVenueMapCellRect[]): string => {
  const segments: OutlineSegment[] = venueMapOuterEdges(rects).map((edge) => ({
    ...edge,
    used: false,
  }));
  if (segments.length === 0) {
    return '';
  }
  const index = indexSegments(segments);
  const loops: string[] = [];
  segments.forEach((segment, segmentIndex) => {
    if (segment.used) {
      return;
    }
    const loop = traceLoop(segments, index, segmentIndex);
    if (loop.length > 0) {
      loops.push(loop);
    }
  });
  return loops.join(' ');
};
