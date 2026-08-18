/** Longitude valid range (WGS84). */
export const GEO_MAP_LONGITUDE_MIN = -180;
export const GEO_MAP_LONGITUDE_MAX = 180;

/** Latitude valid range (WGS84). */
export const GEO_MAP_LATITUDE_MIN = -90;
export const GEO_MAP_LATITUDE_MAX = 90;

/** Minimum allowed model scale (must be positive). */
export const GEO_MAP_SCALE_MIN_EXCLUSIVE = 0;

/** MapLibre zoom clamp for when the 3D model replaces the marker. */
export const GEO_MAP_MIN_ZOOM_MIN = 0;
export const GEO_MAP_MIN_ZOOM_MAX = 22;

export const GEO_MAP_DEFAULT_ALTITUDE_M = 0;
export const GEO_MAP_DEFAULT_HEADING_DEG = 0;
/**
 * Typical Y-up glTF/GLB needs 90° Rotation X (`pitchDeg`) for MapLibre Three.js
 * custom layer (Map POC `DEFAULT_MODEL_ROTATION_X_DEG`). Prisma column default
 * stays 0; create paths use this.
 */
export const GEO_MAP_DEFAULT_PITCH_DEG = 90;
export const GEO_MAP_DEFAULT_ROLL_DEG = 0;
export const GEO_MAP_DEFAULT_SCALE = 1;
export const GEO_MAP_DEFAULT_MIN_ZOOM = 14;

/** Nominatim search (admin address fly-to). Usage policy requires a contactable UA. */
export const GEO_MAP_GEOCODE_NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
export const GEO_MAP_GEOCODE_USER_AGENT = 'ToonExpoAdminGeocoder/1.0';
export const GEO_MAP_GEOCODE_TIMEOUT_MS = 8_000;
export const GEO_MAP_GEOCODE_QUERY_MIN_LENGTH = 3;
export const GEO_MAP_GEOCODE_QUERY_MAX_LENGTH = 200;
export const GEO_MAP_GEOCODE_COUNTRY_CODES = 'am';
