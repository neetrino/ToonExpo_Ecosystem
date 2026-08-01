/** GeoMapCanvas constants — see docs/3D-MAP-PLAN.md (Stage 2a). */

/** Default map center — Yerevan (docs/3D-MAP-PLAN.md). */
export const DEFAULT_MAP_CENTER_LONGITUDE = 44.5152;
export const DEFAULT_MAP_CENTER_LATITUDE = 40.1872;
export const DEFAULT_MAP_ZOOM = 12;

/**
 * Default camera pitch for all GeoMapCanvas maps — pitched city view
 * (slightly from the side), not top-down. Degrees from the screen plane.
 */
export const DEFAULT_MAP_PITCH_DEG = 55;

/** Default bearing (0 = north-up). Pitch alone is enough for the 3D look. */
export const DEFAULT_MAP_BEARING_DEG = 0;

/**
 * Max camera pitch users can reach via tilt / touch / Ctrl+drag.
 * MapLibre allows up to 85; values above 60 are experimental.
 */
export const MAX_MAP_PITCH_DEG = 85;

/** Pitch step for the compact tilt + / − controls (degrees). */
export const MAP_PITCH_STEP_DEG = 10;

/** Ease duration for tilt / reset camera control actions (ms). */
export const MAP_CAMERA_EASE_DURATION_MS = 300;

/** Zoom level delta for map control buttons. */
export const MAP_ZOOM_STEP = 1;

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
  'inline-block w-max cursor-pointer select-none whitespace-nowrap rounded-full border border-border-strong ' +
  'bg-surface-elevated px-2 py-1 text-xs font-medium text-ink shadow-sm ' +
  'transition-opacity duration-200';

export const MARKER_ELEMENT_EDITABLE_CLASS_NAME = 'cursor-grab active:cursor-grabbing';

/**
 * Extra zoom above an object's `minZoom` when focusing so the GLB is clearly
 * past the marker→model threshold.
 */
export const FOCUS_ZOOM_ABOVE_MIN = 1.25;

/** MapLibre `flyTo` duration for focus requests (ms). */
export const FOCUS_FLY_TO_DURATION_MS = 1600;

/** Camera pitch applied on focus — kept identical to the default pitched view. */
export const FOCUS_PITCH_DEG = DEFAULT_MAP_PITCH_DEG;

/** Marker element class applied while `highlightedObjectId` matches. */
export const MARKER_ELEMENT_HIGHLIGHTED_CLASS_NAME =
  'ring-2 ring-brand-deep border-brand-deep shadow-md';

/** MapLibre canvas gains this class while the pointer is over a pickable model. */
export const MAP_CANVAS_HOVER_CURSOR_CLASS = 'cursor-pointer';

/** OpenFreeMap liberty layer that provides surrounding OSM building extrusions. */
export const OSM_BUILDING_EXTRUSION_LAYER_ID = 'building-3d';
export const OSM_BUILDING_FILL_LAYER_ID = 'building';
export const OSM_BUILDING_EXTRUSION_MIN_ZOOM = 15;

/**
 * Hide OSM `building-3d` fill-extrusions near published GLB anchors via a
 * MapLibre `distance` filter (true vector-tile subtraction needs custom tiles).
 */
export const MODEL_FOOTPRINT_SOURCE_ID = 'geo-map-model-footprints';
export const MODEL_FOOTPRINT_MASK_LAYER_ID = 'geo-map-model-footprint-mask';
/** Radius around each model center where OSM extrusions are filtered out (meters). */
export const MODEL_FOOTPRINT_MASK_RADIUS_METERS = 80;
/** N-gon segment count for circular footprint helpers / tests. */
export const MODEL_FOOTPRINT_MASK_SEGMENT_COUNT = 24;
