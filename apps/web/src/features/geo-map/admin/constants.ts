import { ADMIN_COMPANIES_MAX_PAGE_SIZE } from '@/features/admin/constants';
import { DEFAULT_MODEL_MIN_ZOOM, GEO_MAP_DEFAULT_PITCH_DEG } from '@/features/geo-map/constants';

/** TanStack Query key for `GET /admin/geo-map/models`. */
export const ADMIN_GEO_MAP_MODELS_QUERY_KEY = ['admin', 'geo-map', 'models'] as const;

/** Page size for the project picker (API max = `ADMIN_COMPANIES_MAX_PAGE_SIZE`). */
export const GEO_MAP_ADMIN_PROJECTS_PAGE_SIZE = ADMIN_COMPANIES_MAX_PAGE_SIZE;

/** Matches NestJS `MEDIA_MODEL3D_UPLOAD_MAX_BYTES`. */
export const GEO_MAP_GLB_MAX_BYTES = 100 * 1024 * 1024;

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
export const GEO_MAP_ADMIN_GEOCODE_PATH = '/admin/geo-map/geocode';

/** Zoom used after an address lookup so OSM buildings are clickable. */
export const GEO_MAP_ADDRESS_SEARCH_ZOOM = 16;

/** Unsaved pin shown after address lookup; drag does not persist until Place. */
export const GEO_MAP_PREVIEW_PIN_ID = 'geo-map-preview-pin';

/** Above MapLibre max zoom so the preview never loads a GLB. */
export const GEO_MAP_PREVIEW_MIN_ZOOM = 99;

/** Wait after typing before geocoding (Nominatim ~1 req/s). */
export const GEO_MAP_ADDRESS_GEOCODE_DEBOUNCE_MS = 1_000;

/** Lucide icons in the sticky edit action bar. */
export const GEO_MAP_EDIT_ACTION_ICON_CLASS = 'size-3.5 shrink-0';

/** Equal-width action buttons in the 3D map edit footer. */
export const GEO_MAP_EDIT_ACTION_BUTTON_CLASS = 'min-w-0 flex-1 px-2 text-xs';
