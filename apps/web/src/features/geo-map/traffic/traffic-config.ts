/** Sparse close-range traffic — far stricter than the Map POC fleet. */

export const VEHICLE_LAYER_ID = 'geo-map-vehicles';

/** Cars hidden below this zoom (unless high-pitch exception applies). */
export const VEHICLE_MIN_ZOOM = 17;

/** High-pitch exception floor when pitch ≥ {@link VEHICLE_HIGH_PITCH_DEG}. */
export const VEHICLE_HIGH_PITCH_MIN_ZOOM = 16.5;
export const VEHICLE_HIGH_PITCH_DEG = 50;

/** Animate along roads only at/above this zoom; below = static or hidden. */
export const VEHICLE_ANIMATE_MIN_ZOOM = 17.5;

/** Hard viewport fleet cap. */
export const VEHICLE_MAX_COUNT = 16;

/** Debounce road rediscovery on moveend (ms). */
export const VEHICLE_REDISCOVER_DEBOUNCE_MS = 600;

/** Equal cruise speed (m/s). */
export const VEHICLE_SPEED_MPS = 7;

/** Minimum bumper gap along a road (m). */
export const VEHICLE_MIN_GAP_M = 18;

/** Spawn spacing along a road (m). */
export const VEHICLE_SPACING_M = 28;

/** Max road segments kept from vector tiles. */
export const VEHICLE_MAX_ROAD_SEGMENTS = 80;

/** Minimum road length to host a car (m). */
export const VEHICLE_MIN_ROAD_LENGTH_M = 40;

export const CAR_MODEL_URLS = [
  '/models/cars/sedan.glb',
  '/models/cars/hatchback-sports.glb',
  '/models/cars/suv.glb',
  '/models/cars/taxi.glb',
] as const;

/** Kenney car kit length ≈ 2.55 units → ~4.5 m on map. */
export const CAR_SCENE_SCALE = 1.75;

export const CAR_COLORMAP_URL = '/models/cars/Textures/colormap.webp';
