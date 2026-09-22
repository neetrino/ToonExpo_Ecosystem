import type { GreenLngLat, LngLatRing } from '@/features/geo-map/trees/types';

/** Ray-cast point-in-polygon for a closed lng/lat ring. */
export const isPointInRing = (point: GreenLngLat, ring: LngLatRing): boolean => {
  let inside = false;
  for (
    let index = 0, previous = ring.length - 1;
    index < ring.length;
    previous = index, index += 1
  ) {
    const current = ring[index];
    const last = ring[previous];
    if (!current || !last) {
      continue;
    }
    const [xi, yi] = current;
    const [xj, yj] = last;
    const intersects =
      yi > point.latitude !== yj > point.latitude &&
      point.longitude < ((xj - xi) * (point.latitude - yi)) / (yj - yi) + xi;
    if (intersects) {
      inside = !inside;
    }
  }
  return inside;
};
