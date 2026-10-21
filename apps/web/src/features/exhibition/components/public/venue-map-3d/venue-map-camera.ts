import type { VenueBoothMesh } from '@/features/exhibition/components/public/venue-map-3d/venue-map-booth-meshes';
import {
  VENUE_CAMERA_DIST_MAX,
  VENUE_CAMERA_DIST_MIN,
  VENUE_CAMERA_POL_MAX,
  VENUE_CAMERA_TX_MAX,
  VENUE_CAMERA_TX_MIN,
  VENUE_CAMERA_TZ_MAX,
  VENUE_CAMERA_TZ_MIN,
  VENUE_FLAT_POL,
  VENUE_PAN_SCALE,
  type VenueCamera,
} from '@/features/exhibition/components/public/venue-map-3d/venue-map-scene-math';

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

export const clampVenueCamera = (camera: VenueCamera): void => {
  camera.dist = clamp(camera.dist, VENUE_CAMERA_DIST_MIN, VENUE_CAMERA_DIST_MAX);
  camera.pol = clamp(camera.pol, VENUE_FLAT_POL, VENUE_CAMERA_POL_MAX);
  camera.tx = clamp(camera.tx, VENUE_CAMERA_TX_MIN, VENUE_CAMERA_TX_MAX);
  camera.tz = clamp(camera.tz, VENUE_CAMERA_TZ_MIN, VENUE_CAMERA_TZ_MAX);
};

export const panVenueCamera = (camera: VenueCamera, dx: number, dy: number): void => {
  const scale = camera.dist * VENUE_PAN_SCALE;
  const sin = Math.sin(camera.az);
  const cos = Math.cos(camera.az);
  camera.tx -= (dx * cos + dy * sin) * scale;
  camera.tz -= (-dx * sin + dy * cos) * scale;
  clampVenueCamera(camera);
};

export const focusBooth = (camera: VenueCamera, booth: VenueBoothMesh, flat: boolean): void => {
  camera.tx = booth.top.x;
  camera.tz = booth.top.z;
  camera.dist = Math.min(camera.dist, 85);
  camera.pol = flat ? VENUE_FLAT_POL : 0.82;
  clampVenueCamera(camera);
};
