/** GeoMapCanvas constants — see docs/3D-MAP-PLAN.md (Stage 2a). */

/** Default map center — Yerevan (docs/3D-MAP-PLAN.md). */
export const DEFAULT_MAP_CENTER_LONGITUDE = 44.5152;
export const DEFAULT_MAP_CENTER_LATITUDE = 40.1872;
export const DEFAULT_MAP_ZOOM = 12;

/** Env var name consumers/scripts can set to override the MapLibre style URL. */
export const MAP_STYLE_URL_ENV_VAR = 'NEXT_PUBLIC_MAP_STYLE_URL';

/** Free, no-API-key MapLibre style (OpenFreeMap "liberty"). */
export const DEFAULT_MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

/** Matches the Prisma `ProjectMapModel.minZoom` default. */
export const DEFAULT_MODEL_MIN_ZOOM = 14;

export const MIN_MAP_ZOOM = 0;
export const MAX_MAP_ZOOM = 22;

/** Prefix for per-model-URL `ScenegraphLayer` ids (grouped by GLB url). */
export const SCENEGRAPH_LAYER_ID_PREFIX = 'geo-map-scenegraph-layer';
export const SCENEGRAPH_SIZE_SCALE = 1;
/** Disabled — sizeMinPixels fights real-meter GLBs and huge authoring-unit assets. */
export const SCENEGRAPH_SIZE_MIN_PIXELS = 0;

/**
 * Insert ScenegraphLayer before this liberty style layer so GLBs draw *above*
 * `building-3d` fill-extrusions when using interleaved overlay mode.
 * Currently unused while `MapboxOverlay` runs with `interleaved: false`.
 */
export const SCENEGRAPH_BEFORE_LAYER_ID = 'boundary_3';

/**
 * Same-origin Next.js rewrite prefix for R2 GLB assets (CORS-safe for deck.gl).
 * Must stay in sync with the rewrite in `apps/web/next.config.ts`.
 */
export const GEO_MAP_R2_PROXY_PATH_PREFIX = '/r2-proxy';

/** Zoom span over which model opacity eases from floor → full after `minZoom`. */
export const MODEL_FADE_ZOOM_DELTA = 0.75;
export const MODEL_FADE_MIN_OPACITY = 0.45;

/** Zoom span over which marker opacity eases out as `minZoom` approaches. */
export const MARKER_FADE_ZOOM_DELTA = 0.75;

/**
 * Bounds padding (degrees) applied around the current viewport so objects just
 * outside the visible frame still resolve as visible while panning.
 * Markers are cheap (DOM), so they get a generous margin; GLB models are
 * expensive to load, so their margin is tight to cap concurrent loads.
 */
export const MARKER_BOUNDS_PADDING_DEGREES = 0.5;
export const MODEL_BOUNDS_PADDING_DEGREES = 0.05;

export const MARKER_ELEMENT_CLASS_NAME =
  'cursor-pointer select-none whitespace-nowrap rounded-full border border-border-strong ' +
  'bg-surface-elevated px-2 py-1 text-xs font-medium text-ink shadow-sm ' +
  'transition-opacity duration-200';

export const MARKER_ELEMENT_EDITABLE_CLASS_NAME = 'cursor-grab active:cursor-grabbing';

export const NAVIGATION_CONTROL_POSITION = 'top-right';

/** MapLibre canvas gains this class while the pointer is over a pickable model. */
export const MAP_CANVAS_HOVER_CURSOR_CLASS = 'cursor-pointer';

/** OpenFreeMap liberty layer that provides surrounding OSM building extrusions. */
export const OSM_BUILDING_EXTRUSION_LAYER_ID = 'building-3d';
export const OSM_BUILDING_FILL_LAYER_ID = 'building';
export const OSM_BUILDING_EXTRUSION_MIN_ZOOM = 15;
