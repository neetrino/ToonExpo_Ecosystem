import { createSeededRandom } from '@/features/geo-map/vegetation/deterministic-random';
import {
  bboxOf,
  metersToLngLat,
  pointInRing,
  ringCentroid,
  ringToMeters,
  type LngLat,
  type MeterPoint,
} from '@/features/geo-map/vegetation/polygon-geometry';

export type SamplingResult = {
  points: LngLat[];
  attempted: number;
  rejected: number;
};

/**
 * Uniform jittered grid across a polygon bbox, then even subsample to `maxPoints`.
 */
export const samplePolygonGrid = (opts: {
  ring: LngLat[];
  holes?: LngLat[][];
  spacingM: number;
  edgePaddingM: number;
  maxPoints: number;
  seed: string;
}): SamplingResult => {
  const { ring, holes = [], spacingM, edgePaddingM, maxPoints, seed } = opts;
  if (ring.length < 3 || maxPoints <= 0 || spacingM <= 0) {
    return { points: [], attempted: 0, rejected: 0 };
  }

  const origin = ringCentroid(ring);
  const outer = ringToMeters(ring, origin);
  const holeMeters = holes.map((h) => ringToMeters(h, origin));
  const bounds = bboxOf(outer);
  const rand = createSeededRandom(seed);
  let attempted = 0;
  let rejected = 0;

  const pad = Math.max(0, edgePaddingM);
  const minX = bounds.minX + pad;
  const maxX = bounds.maxX - pad;
  const minY = bounds.minY + pad;
  const maxY = bounds.maxY - pad;
  if (maxX <= minX || maxY <= minY) {
    return { points: [], attempted: 0, rejected: 0 };
  }

  const width = maxX - minX;
  const height = maxY - minY;
  const cols = Math.max(2, Math.ceil(width / spacingM));
  const rows = Math.max(2, Math.ceil(height / spacingM));
  const stepX = width / cols;
  const stepY = height / rows;
  const jitter = Math.min(stepX, stepY) * 0.28;
  const candidates: MeterPoint[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      attempted++;
      const candidate: MeterPoint = {
        x: minX + (col + 0.5) * stepX + (rand() - 0.5) * 2 * jitter,
        y: minY + (row + 0.5) * stepY + (rand() - 0.5) * 2 * jitter,
      };
      if (!pointInRing(candidate, outer) || holeMeters.some((h) => pointInRing(candidate, h))) {
        rejected++;
        continue;
      }
      candidates.push(candidate);
    }
  }

  if (candidates.length <= maxPoints) {
    return {
      points: candidates.map((p) => metersToLngLat(p, origin)),
      attempted,
      rejected,
    };
  }

  return {
    points: evenSubsample(candidates, maxPoints).map((p) => metersToLngLat(p, origin)),
    attempted,
    rejected,
  };
};

const evenSubsample = (candidates: MeterPoint[], maxPoints: number): MeterPoint[] => {
  const used = new Set<number>();
  const accepted: MeterPoint[] = [];
  const step = candidates.length / maxPoints;
  for (let i = 0; i < maxPoints; i++) {
    let idx = Math.min(candidates.length - 1, Math.floor(i * step));
    while (used.has(idx) && used.size < candidates.length) {
      idx = (idx + 1) % candidates.length;
    }
    used.add(idx);
    accepted.push(candidates[idx]!);
  }
  return accepted;
};
