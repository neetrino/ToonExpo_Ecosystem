import { ADMIN_COMPANIES_MAX_PAGE_SIZE } from '@/features/admin/constants';
import { DEFAULT_MODEL_MIN_ZOOM, GEO_MAP_DEFAULT_PITCH_DEG } from '@/features/geo-map/constants';

/** TanStack Query key for `GET /admin/geo-map/models`. */
export const ADMIN_GEO_MAP_MODELS_QUERY_KEY = ['admin', 'geo-map', 'models'] as const;

/** Page size for the project picker (API max = `ADMIN_COMPANIES_MAX_PAGE_SIZE`). */
export const GEO_MAP_ADMIN_PROJECTS_PAGE_SIZE = ADMIN_COMPANIES_MAX_PAGE_SIZE;

/** Matches NestJS `MEDIA_MODEL3D_UPLOAD_MAX_BYTES`. */
export const GEO_MAP_GLB_MAX_BYTES = 15 * 1024 * 1024;

export const GEO_MAP_GLB_EXTENSION = '.glb';

/** Browsers often omit a MIME type for `.glb`; accept empty / octet-stream too. */
export const GEO_MAP_GLB_ALLOWED_MIME_TYPES = [
  'model/gltf-binary',
  'application/octet-stream',
  '',
] as const;

export const GEO_MAP_HEADING_MIN_DEG = 0;
export const GEO_MAP_HEADING_MAX_DEG = 360;
export const GEO_MAP_SCALE_MIN = 0.01;
export const GEO_MAP_SCALE_MAX = 100;
export const GEO_MAP_ALTITUDE_MIN_M = -100;
export const GEO_MAP_ALTITUDE_MAX_M = 500;
export const GEO_MAP_PITCH_MIN_DEG = -180;
export const GEO_MAP_PITCH_MAX_DEG = 180;
export const GEO_MAP_ROLL_MIN_DEG = -180;
export const GEO_MAP_ROLL_MAX_DEG = 180;
export const GEO_MAP_MIN_ZOOM_FIELD_MIN = 0;
export const GEO_MAP_MIN_ZOOM_FIELD_MAX = 22;

export const GEO_MAP_DEFAULT_CREATE_VALUES = {
  altitudeM: 0,
  headingDeg: 0,
  /** Y-up GLB → MapLibre upright — see `GEO_MAP_DEFAULT_PITCH_DEG`. */
  pitchDeg: GEO_MAP_DEFAULT_PITCH_DEG,
  rollDeg: 0,
  scale: 1,
  minZoom: DEFAULT_MODEL_MIN_ZOOM,
  isPublished: false,
} as const;

export const GEO_MAP_ADMIN_API_PREFIX = '/admin/geo-map/models';
