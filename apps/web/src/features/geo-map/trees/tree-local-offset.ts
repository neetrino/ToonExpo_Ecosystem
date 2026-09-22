import { MercatorCoordinate } from 'maplibre-gl';

import type { GreenLngLat } from '@/features/geo-map/trees/types';

export type LocalMeters = {
  x: number;
  y: number;
  z: number;
};

/**
 * Local meters from a mercator origin so InstancedMesh can share one
 * `composeModelTransformMatrix` pose (same as building GLBs).
 */
export const treeLocalOffsetM = (
  origin: GreenLngLat,
  point: GreenLngLat,
  meterScale: number,
): LocalMeters => {
  const originMercator = MercatorCoordinate.fromLngLat([origin.longitude, origin.latitude], 0);
  const pointMercator = MercatorCoordinate.fromLngLat([point.longitude, point.latitude], 0);
  return {
    x: (pointMercator.x - originMercator.x) / meterScale,
    y: 0,
    z: (pointMercator.y - originMercator.y) / meterScale,
  };
};
