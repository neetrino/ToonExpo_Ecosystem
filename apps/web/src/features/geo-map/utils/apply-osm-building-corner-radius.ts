import type { MapLibreMap } from 'maplibre-gl';

import { OSM_BUILDING_CORNER_RADIUS_M } from '@/features/geo-map/constants';

const ROUNDED_CORNER_LAYOUT = 'fill-extrusion-rounded-corner-distance';

/**
 * GPU-side corner rounding on an existing fill-extrusion layer.
 * Distance is a layout number — MapLibre rejects expressions here.
 */
export const applyOsmBuildingCornerRadius = (
  map: MapLibreMap,
  layerId: string,
  distanceM: number = OSM_BUILDING_CORNER_RADIUS_M,
): void => {
  if (!map.getLayer(layerId)) {
    return;
  }
  try {
    (map.setLayoutProperty as (id: string, name: string, next: unknown) => void)(
      layerId,
      ROUNDED_CORNER_LAYOUT,
      distanceM,
    );
  } catch {
    /* MapLibre < 6.2 has no rounded-corner layout key */
  }
};
