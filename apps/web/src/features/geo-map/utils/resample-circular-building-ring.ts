import {
  OSM_SMOOTH_CIRCLE_COVER_PAD,
  OSM_SMOOTH_CIRCLE_SEGMENTS,
} from '@/features/geo-map/constants';
import { closeBuildingRing, openBuildingRing } from '@/features/geo-map/utils/open-building-ring';

/**
 * Replace a faceted OSM circle with a regular N-gon whose sides sit outside
 * the old circumcircle, so GPU `rounded-corner-distance` can fillet the walls.
 */
export const resampleCircularBuildingRing = (
  ring: readonly (readonly number[])[],
  segments: number = OSM_SMOOTH_CIRCLE_SEGMENTS,
  coverPad: number = OSM_SMOOTH_CIRCLE_COVER_PAD,
): number[][] => {
  const open = openBuildingRing(ring);
  if (open.length < 3) {
    return closeBuildingRing(open);
  }
  let sumLng = 0;
  let sumLat = 0;
  for (const point of open) {
    sumLng += point[0] ?? 0;
    sumLat += point[1] ?? 0;
  }
  const centerLng = sumLng / open.length;
  const centerLat = sumLat / open.length;
  let radius = 0;
  for (const point of open) {
    radius = Math.max(radius, Math.hypot((point[0] ?? 0) - centerLng, (point[1] ?? 0) - centerLat));
  }
  const safeSegments = Math.max(segments, 3);
  radius *= coverPad / Math.cos(Math.PI / safeSegments);
  const smooth: number[][] = [];
  for (let index = 0; index < safeSegments; index += 1) {
    const angle = (index / segments) * Math.PI * 2;
    smooth.push([centerLng + Math.cos(angle) * radius, centerLat + Math.sin(angle) * radius]);
  }
  return closeBuildingRing(smooth);
};
