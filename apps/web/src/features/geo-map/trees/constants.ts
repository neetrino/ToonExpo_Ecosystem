/** Admin-only park canopy — code-driven, never persisted. */

export const GREEN_CANOPY_LAYER_ID = 'geo-map-green-canopy';

/** Trees appear only after this zoom (same threshold as OSM 3D buildings). */
export const GREEN_CANOPY_MIN_ZOOM = 15;

/** World-grid step. Same park cell is always the same tree. */
export const GREEN_CANOPY_NEAR_SPACING_M = 8;

/** Hard GPU cap for one InstancedMesh batch. */
export const GREEN_CANOPY_MAX_VISIBLE = 1_400;

/** Safety cap on raw world-grid samples in the current clip. */
export const GREEN_CANOPY_RAW_SAMPLE_CAP = 4_000;

export const GREEN_CANOPY_MIN_SPACING_M = 5;

export const GREEN_MAP_LAYER_IDS = ['park', 'landcover_wood', 'landcover_grass'] as const;

export const EARTH_RADIUS_M = 6_371_000;
export const DEG_TO_RAD = Math.PI / 180;
export const METERS_PER_DEG_LAT = EARTH_RADIUS_M * DEG_TO_RAD;

export const GREEN_CANOPY_SCALE_MIN = 0.88;
export const GREEN_CANOPY_SCALE_SPAN = 0.42;

export const TREE_TRUNK_COLOR = 0x5c3d2e;
export const TREE_CANOPY_COLOR_A = 0x2d6a4f;
export const TREE_CANOPY_COLOR_B = 0x40916c;
export const TREE_CANOPY_COLOR_C = 0x1b4332;
