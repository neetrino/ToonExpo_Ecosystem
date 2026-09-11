/** Admin-only road traffic — code-driven, never persisted. */

/** Cars appear only when the street is this close. */
export const ROAD_TRAFFIC_MIN_ZOOM = 16;

/** Sparse gap between cars on the same road. */
export const ROAD_TRAFFIC_SPACING_M = 120;

/** Ignore tiny stubs that cannot host a moving car. */
export const ROAD_TRAFFIC_MIN_PATH_M = 40;

/** Hard GPU cap for one InstancedMesh batch. */
export const ROAD_TRAFFIC_MAX_VISIBLE = 80;

export const ROAD_TRAFFIC_SPEED_MIN_MPS = 7;
export const ROAD_TRAFFIC_SPEED_SPAN_MPS = 5;

export const ROAD_TRAFFIC_ORIGIN_SNAP_DEG = 0.005;

export const ROAD_TRAFFIC_COLOR = 0xf4f4f4;
export const ROAD_TRAFFIC_CABIN_COLOR = 0xfafafa;
export const ROAD_TRAFFIC_GLASS_COLOR = 0x2c333c;
export const ROAD_TRAFFIC_TIRE_COLOR = 0x161616;
export const ROAD_TRAFFIC_RIM_COLOR = 0xc8c8c8;
export const ROAD_TRAFFIC_LIGHT_COLOR = 0xfff4d6;
export const ROAD_TRAFFIC_GRILLE_COLOR = 0x1b1b1b;
export const ROAD_TRAFFIC_TAIL_COLOR = 0x7a1f24;

export const ROAD_RENDER_LAYER_IDS = [
  'road_minor',
  'road_secondary_tertiary',
  'road_trunk_primary',
  'road_motorway',
  'bridge_street',
  'bridge_secondary_tertiary',
  'bridge_trunk_primary',
  'bridge_motorway',
] as const;

export const ROAD_TRANSPORT_CLASSES = [
  'motorway',
  'trunk',
  'primary',
  'secondary',
  'tertiary',
  'minor',
] as const;
