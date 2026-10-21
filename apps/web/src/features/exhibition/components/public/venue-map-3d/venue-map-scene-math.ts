/** PDF points to metres. */
export const VENUE_POINT_SCALE = 0.1;

export const VENUE_ORIGIN_X = 190;
export const VENUE_ORIGIN_Z = 118;

export const toMetres = (points: number): number => points * VENUE_POINT_SCALE;

export const worldX = (metres: number): number => metres - VENUE_ORIGIN_X;

export const worldZ = (metres: number): number => metres - VENUE_ORIGIN_Z;

export type VenueCamera = {
  tx: number;
  tz: number;
  dist: number;
  az: number;
  pol: number;
};

export const VENUE_CAMERA_HOME: VenueCamera = {
  tx: -8,
  tz: -6,
  dist: 330,
  az: -0.3,
  pol: 0.86,
};

export const VENUE_CAMERA_DIST_MIN = 18;
export const VENUE_CAMERA_DIST_MAX = 600;
export const VENUE_CAMERA_POL_MAX = 1.25;
export const VENUE_CAMERA_TX_MIN = -200;
export const VENUE_CAMERA_TX_MAX = 200;
export const VENUE_CAMERA_TZ_MIN = -130;
export const VENUE_CAMERA_TZ_MAX = 130;
export const VENUE_FLAT_POL = 0.001;
export const VENUE_TILT_POL = 0.86;
export const VENUE_CAMERA_LERP = 0.14;
export const VENUE_LIFT_LERP = 0.2;
export const VENUE_SELECTED_LIFT = 1;
export const VENUE_HOVER_LIFT = 0.3;
export const VENUE_ZOOM_STEP = 1.35;
export const VENUE_WHEEL_ZOOM = 0.0012;
export const VENUE_DRAG_ROTATE = 0.006;
export const VENUE_DRAG_TILT = 0.004;
export const VENUE_PAN_SCALE = 0.0016;
export const VENUE_CLICK_MOVE_PX = 6;
export const VENUE_FOCUS_DIST = 85;
export const VENUE_FOCUS_POL = 0.82;
export const VENUE_LABEL_MIN_WIDTH = 30;
export const VENUE_LABEL_WIDTH_RATIO = 0.94;
export const VENUE_PIXEL_RATIO_CAP = 2;
export const VENUE_EXPO_EMAIL = 'toon.expo@bigprojects.am';
