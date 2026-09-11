import { closeBuildingRing, openBuildingRing } from '@/features/geo-map/utils/open-building-ring';

const MIN_ARC_TURN_DEG = 12;
const MAX_ARC_TURN_DEG = 55;
const ARC_EXTRA_POINTS = 3;
const DEG_PER_RAD = 180 / Math.PI;

const turnDeg = (
  prev: readonly number[],
  curr: readonly number[],
  next: readonly number[],
): number => {
  const inX = (curr[0] ?? 0) - (prev[0] ?? 0);
  const inY = (curr[1] ?? 0) - (prev[1] ?? 0);
  const outX = (next[0] ?? 0) - (curr[0] ?? 0);
  const outY = (next[1] ?? 0) - (curr[1] ?? 0);
  const incoming = Math.atan2(inY, inX);
  const outgoing = Math.atan2(outY, outX);
  let delta = (outgoing - incoming) * DEG_PER_RAD;
  if (delta > 180) {
    delta -= 360;
  }
  if (delta < -180) {
    delta += 360;
  }
  return delta;
};

const arcThrough = (
  prev: readonly number[],
  curr: readonly number[],
  next: readonly number[],
): number[][] => {
  const ax = prev[0] ?? 0;
  const ay = prev[1] ?? 0;
  const bx = curr[0] ?? 0;
  const by = curr[1] ?? 0;
  const cx = next[0] ?? 0;
  const cy = next[1] ?? 0;
  const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
  if (Math.abs(d) < 1e-12) {
    return [[bx, by]];
  }
  const a2 = ax * ax + ay * ay;
  const b2 = bx * bx + by * by;
  const c2 = cx * cx + cy * cy;
  const ox = (a2 * (by - cy) + b2 * (cy - ay) + c2 * (ay - by)) / d;
  const oy = (a2 * (cx - bx) + b2 * (ax - cx) + c2 * (bx - ax)) / d;
  const start = Math.atan2(ay - oy, ax - ox);
  const mid = Math.atan2(by - oy, bx - ox);
  const end = Math.atan2(cy - oy, cx - ox);
  let sweep = end - start;
  if (sweep > Math.PI) {
    sweep -= Math.PI * 2;
  }
  if (sweep < -Math.PI) {
    sweep += Math.PI * 2;
  }
  const midOffset = mid - start;
  const midNorm = ((midOffset + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
  if (midNorm * sweep < 0) {
    sweep += sweep > 0 ? -Math.PI * 2 : Math.PI * 2;
  }
  const radius = Math.hypot(bx - ox, by - oy);
  const points: number[][] = [];
  for (let step = 1; step <= ARC_EXTRA_POINTS; step += 1) {
    const angle = start + (sweep * step) / (ARC_EXTRA_POINTS + 1);
    points.push([ox + Math.cos(angle) * radius, oy + Math.sin(angle) * radius]);
  }
  return points;
};

/** Insert extra points on faceted arcs so curved walls read as smooth. */
export const densifyBuildingArcRing = (ring: readonly (readonly number[])[]): number[][] => {
  const open = openBuildingRing(ring);
  if (open.length < 5) {
    return closeBuildingRing(open);
  }
  const densified: number[][] = [];
  for (let index = 0; index < open.length; index += 1) {
    const prev = open[(index + open.length - 1) % open.length];
    const curr = open[index];
    const next = open[(index + 1) % open.length];
    if (!prev || !curr || !next) {
      continue;
    }
    const turn = Math.abs(turnDeg(prev, curr, next));
    if (turn >= MIN_ARC_TURN_DEG && turn <= MAX_ARC_TURN_DEG) {
      densified.push(...arcThrough(prev, curr, next));
      continue;
    }
    densified.push([curr[0] ?? 0, curr[1] ?? 0]);
  }
  return closeBuildingRing(densified);
};
