import {
  OSM_BUILDING_CORNER_SEGMENTS,
  OSM_BUILDING_CPU_FILLET_RADIUS_M,
  OSM_BUILDING_ROUND_MAX_RING_POINTS,
  OSM_BUILDING_ROUND_MIN_EDGE_M,
} from '@/features/geo-map/constants';

const DEG_TO_RAD = Math.PI / 180;
const METERS_PER_DEG_LAT = 111_320;
const STRAIGHT_DOT_MIN = 0.97;
const MIN_FILLET_RADIUS_M = 1;
const EDGE_RADIUS_FRACTION = 0.35;

type Vec = { x: number; y: number };

const metersPerDegLng = (latitude: number): number =>
  METERS_PER_DEG_LAT * Math.max(Math.cos(latitude * DEG_TO_RAD), 0.2);

const toLocal = (point: readonly number[], latitude: number): Vec => ({
  x: (point[0] ?? 0) * metersPerDegLng(latitude),
  y: (point[1] ?? 0) * METERS_PER_DEG_LAT,
});

const toLngLat = (point: Vec, latitude: number): number[] => [
  point.x / metersPerDegLng(latitude),
  point.y / METERS_PER_DEG_LAT,
];

const openRing = (ring: readonly (readonly number[])[]): number[][] => {
  if (ring.length < 2) {
    return [];
  }
  const first = ring[0];
  const last = ring[ring.length - 1];
  const closed = Boolean(first && last && first[0] === last[0] && first[1] === last[1]);
  const open = closed ? ring.slice(0, -1) : ring;
  return open.map((point) => [point[0] ?? 0, point[1] ?? 0]);
};

const filletVertex = (
  prev: Vec,
  curr: Vec,
  next: Vec,
  radiusM: number,
  segments: number,
  latitude: number,
): number[][] => {
  const incoming = { x: curr.x - prev.x, y: curr.y - prev.y };
  const outgoing = { x: next.x - curr.x, y: next.y - curr.y };
  const lenIn = Math.hypot(incoming.x, incoming.y);
  const lenOut = Math.hypot(outgoing.x, outgoing.y);
  const sharp = [toLngLat(curr, latitude)];
  if (lenIn < OSM_BUILDING_ROUND_MIN_EDGE_M || lenOut < OSM_BUILDING_ROUND_MIN_EDGE_M) {
    return sharp;
  }
  incoming.x /= lenIn;
  incoming.y /= lenIn;
  outgoing.x /= lenOut;
  outgoing.y /= lenOut;
  const dot = incoming.x * outgoing.x + incoming.y * outgoing.y;
  if (dot > STRAIGHT_DOT_MIN) {
    return sharp;
  }
  const radius = Math.min(radiusM, lenIn * EDGE_RADIUS_FRACTION, lenOut * EDGE_RADIUS_FRACTION);
  if (radius < MIN_FILLET_RADIUS_M) {
    return sharp;
  }
  const start = { x: curr.x - incoming.x * radius, y: curr.y - incoming.y * radius };
  const end = { x: curr.x + outgoing.x * radius, y: curr.y + outgoing.y * radius };
  const turn = incoming.x * outgoing.y - incoming.y * outgoing.x;
  const sign = turn >= 0 ? 1 : -1;
  const center = {
    x: start.x - incoming.y * radius * sign,
    y: start.y + incoming.x * radius * sign,
  };
  const startAngle = Math.atan2(start.y - center.y, start.x - center.x);
  const endAngle = Math.atan2(end.y - center.y, end.x - center.x);
  let sweep = endAngle - startAngle;
  if (sign > 0 && sweep < 0) {
    sweep += Math.PI * 2;
  }
  if (sign < 0 && sweep > 0) {
    sweep -= Math.PI * 2;
  }
  const points: number[][] = [];
  for (let step = 0; step <= segments; step += 1) {
    const angle = startAngle + (sweep * step) / segments;
    points.push(
      toLngLat(
        { x: center.x + Math.cos(angle) * radius, y: center.y + Math.sin(angle) * radius },
        latitude,
      ),
    );
  }
  return points;
};

/**
 * Rounds boxy OSM rings with a small inward fillet.
 * Detailed footprints are left unchanged so sync stays cheap.
 */
export const roundBuildingRing = (
  ring: readonly (readonly number[])[],
  radiusM: number = OSM_BUILDING_CPU_FILLET_RADIUS_M,
  segments: number = OSM_BUILDING_CORNER_SEGMENTS,
): number[][] => {
  const open = openRing(ring);
  if (open.length < 3 || open.length > OSM_BUILDING_ROUND_MAX_RING_POINTS) {
    return ring.map((point) => [point[0] ?? 0, point[1] ?? 0]);
  }
  const latitude = open[0]?.[1] ?? 0;
  const rounded: number[][] = [];
  for (let index = 0; index < open.length; index += 1) {
    const prev = open[(index + open.length - 1) % open.length];
    const curr = open[index];
    const next = open[(index + 1) % open.length];
    if (!prev || !curr || !next) {
      continue;
    }
    rounded.push(
      ...filletVertex(
        toLocal(prev, latitude),
        toLocal(curr, latitude),
        toLocal(next, latitude),
        radiusM,
        segments,
        latitude,
      ),
    );
  }
  const first = rounded[0];
  if (first) {
    rounded.push([first[0] ?? 0, first[1] ?? 0]);
  }
  return rounded;
};
