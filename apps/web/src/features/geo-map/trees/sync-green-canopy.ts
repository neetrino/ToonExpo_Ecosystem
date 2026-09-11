import type { MapLibreMap } from 'maplibre-gl';

import {
  GREEN_CANOPY_MIN_ZOOM,
  GREEN_CANOPY_NEAR_SPACING_M,
} from '@/features/geo-map/trees/constants';
import { collectGreenRingsFromMap } from '@/features/geo-map/trees/collect-green-rings';
import { pickVisibleTreePoints } from '@/features/geo-map/trees/pick-visible-tree-points';
import { sampleGreenTreePoints } from '@/features/geo-map/trees/sample-green-tree-points';
import type { CanopyTreeInstance, GreenLngLat } from '@/features/geo-map/trees/types';

const ORIGIN_SNAP_DEG = 0.005;

const snapCanopyOrigin = (longitude: number, latitude: number): GreenLngLat => ({
  longitude: Math.round(longitude / ORIGIN_SNAP_DEG) * ORIGIN_SNAP_DEG,
  latitude: Math.round(latitude / ORIGIN_SNAP_DEG) * ORIGIN_SNAP_DEG,
});

export type CanopyInstanceTarget = {
  setCanopyInstances: (instances: readonly CanopyTreeInstance[], origin: GreenLngLat) => void;
};

/** Rebuild viewport trees from loaded green polygons / park POIs. */
export const syncGreenCanopy = (
  map: MapLibreMap,
  layer: CanopyInstanceTarget,
  enabled: boolean,
): void => {
  const center = map.getCenter();
  const origin = snapCanopyOrigin(center.lng, center.lat);
  if (!enabled || map.getZoom() < GREEN_CANOPY_MIN_ZOOM) {
    layer.setCanopyInstances([], origin);
    return;
  }
  const bounds = map.getBounds();
  const sampled = sampleGreenTreePoints(
    collectGreenRingsFromMap(map),
    {
      west: bounds.getWest(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      north: bounds.getNorth(),
    },
    GREEN_CANOPY_NEAR_SPACING_M,
  );
  layer.setCanopyInstances(pickVisibleTreePoints(sampled), origin);
};
