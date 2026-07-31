import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl';

import { CITY_MAP_DRAFT_PREVIEW_ID, type CityMapModelPose } from '../constants';

const FIT_PINS_PADDING_PX = 72;
const FIT_PINS_MAX_ZOOM = 13.5;
const FIT_PINS_DURATION_MS = 900;
const FIT_PINS_PITCH_DEG = 45;

/**
 * Fits the camera to pin poses. Returns true when a fit was applied.
 */
export const fitCityMapToPinPoses = (map: MapLibreMap, poses: CityMapModelPose[]): boolean => {
  const fitPoses = poses.filter((pose) => pose.id !== CITY_MAP_DRAFT_PREVIEW_ID);
  if (fitPoses.length === 0) {
    return false;
  }
  const bounds = new maplibregl.LngLatBounds();
  for (const pose of fitPoses) {
    bounds.extend([pose.longitude, pose.latitude]);
  }
  if (bounds.isEmpty()) {
    return false;
  }
  map.fitBounds(bounds, {
    padding: FIT_PINS_PADDING_PX,
    maxZoom: FIT_PINS_MAX_ZOOM,
    duration: FIT_PINS_DURATION_MS,
    pitch: FIT_PINS_PITCH_DEG,
  });
  return true;
};
