import type { MapLibreMap } from 'maplibre-gl';

import { collectRoadLinesFromMap } from '@/features/geo-map/traffic/collect-road-lines';
import {
  ROAD_TRAFFIC_MIN_ZOOM,
  ROAD_TRAFFIC_ORIGIN_SNAP_DEG,
} from '@/features/geo-map/traffic/constants';
import { sampleRoadCars } from '@/features/geo-map/traffic/sample-road-cars';
import type { RoadTrafficState } from '@/features/geo-map/traffic/types';
import type { GreenLngLat } from '@/features/geo-map/trees/types';

const snapTrafficOrigin = (longitude: number, latitude: number): GreenLngLat => ({
  longitude: Math.round(longitude / ROAD_TRAFFIC_ORIGIN_SNAP_DEG) * ROAD_TRAFFIC_ORIGIN_SNAP_DEG,
  latitude: Math.round(latitude / ROAD_TRAFFIC_ORIGIN_SNAP_DEG) * ROAD_TRAFFIC_ORIGIN_SNAP_DEG,
});

export type RoadTrafficTarget = {
  setRoadTraffic: (state: RoadTrafficState | null) => void;
};

/** Rebuild visible-road cars. Animation continues on the shared Three layer. */
export const syncRoadTraffic = (
  map: MapLibreMap,
  layer: RoadTrafficTarget,
  enabled: boolean,
): void => {
  if (!enabled || map.getZoom() < ROAD_TRAFFIC_MIN_ZOOM) {
    layer.setRoadTraffic(null);
    return;
  }
  const bounds = map.getBounds();
  const clip = {
    west: bounds.getWest(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    north: bounds.getNorth(),
  };
  const sampled = sampleRoadCars(collectRoadLinesFromMap(map), clip);
  if (sampled.actors.length === 0) {
    layer.setRoadTraffic(null);
    return;
  }
  const center = map.getCenter();
  layer.setRoadTraffic({
    ...sampled,
    clip,
    origin: snapTrafficOrigin(center.lng, center.lat),
  });
};
