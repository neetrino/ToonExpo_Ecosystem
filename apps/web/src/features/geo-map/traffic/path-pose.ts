import { DEG_TO_RAD } from '@/features/geo-map/trees/constants';
import { distanceM } from '@/features/geo-map/trees/distance-m';
import type { GreenLngLat } from '@/features/geo-map/trees/types';
import type { TrafficCarPose } from '@/features/geo-map/traffic/types';

export const pathLengthM = (points: readonly GreenLngLat[]): number => {
  let length = 0;
  for (let index = 1; index < points.length; index += 1) {
    const from = points[index - 1];
    const to = points[index];
    if (from && to) {
      length += distanceM(from, to);
    }
  }
  return length;
};

/** Heading in the Y-up mercator frame: 0 faces south (+Z), 90 faces east (+X). */
export const pathHeadingDeg = (from: GreenLngLat, to: GreenLngLat): number => {
  const meanLat = ((from.latitude + to.latitude) / 2) * DEG_TO_RAD;
  const east = (to.longitude - from.longitude) * Math.cos(meanLat);
  const south = from.latitude - to.latitude;
  return (Math.atan2(east, south) * 180) / Math.PI;
};

export const poseAlongPath = (
  points: readonly GreenLngLat[],
  distanceAlongM: number,
): TrafficCarPose | null => {
  if (points.length < 2) {
    return null;
  }
  let remaining = distanceAlongM;
  for (let index = 1; index < points.length; index += 1) {
    const from = points[index - 1];
    const to = points[index];
    if (!from || !to) {
      continue;
    }
    const segment = distanceM(from, to);
    if (segment <= 0) {
      continue;
    }
    if (remaining > segment && index < points.length - 1) {
      remaining -= segment;
      continue;
    }
    const t = Math.min(Math.max(remaining / segment, 0), 1);
    return {
      longitude: from.longitude + (to.longitude - from.longitude) * t,
      latitude: from.latitude + (to.latitude - from.latitude) * t,
      headingDeg: pathHeadingDeg(from, to),
    };
  }
  return null;
};

export const roadLineKey = (points: readonly GreenLngLat[]): string => {
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last) {
    return '';
  }
  return `${first.longitude.toFixed(5)}:${first.latitude.toFixed(5)}:${last.longitude.toFixed(5)}:${last.latitude.toFixed(5)}`;
};
