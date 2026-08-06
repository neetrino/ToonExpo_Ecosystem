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

/** Pitch step for the compact tilt ↑ / ↓ controls (degrees). */
export const MAP_PITCH_STEP_DEG = 10;

/** Bearing step for the compact rotate ← / → controls (degrees). */
export const MAP_BEARING_STEP_DEG = 15;

/** Ease duration for zoom / rotate / tilt camera control actions (ms). */
export const MAP_CAMERA_EASE_DURATION_MS = 300;

/**
 * Cold-start camera: MapLibre mounts at pitch 0 for a fast first paint, then
 * eases once to {@link DEFAULT_MAP_PITCH_DEG} after style idle (default path only).
 */
export const COLD_START_MAP_PITCH_DEG = 0;
export const COLD_START_PITCH_EASE_DURATION_MS = 800;

/** MapLibre ctor: skip label/icon fade-in for snappier tile paint. */
export const MAP_FADE_DURATION_MS = 0;

/** Cap device pixel ratio so retina devices do not over-render the WebGL canvas. */
export const MAP_MAX_PIXEL_RATIO = 2;

/** MapLibre WebGL antialias — off for cheaper fragment work on mobile GPUs. */
export const MAP_ANTIALIAS_ENABLED = false;

/** Zoom decimals kept in React viewport state (avoids setState on sub-pixel ticks). */
export const VIEWPORT_ZOOM_QUANTIZE_DECIMALS = 2;

/** Bounds decimals for viewport signature equality. */
export const VIEWPORT_BOUNDS_QUANTIZE_DECIMALS = 4;

/** Model lng/lat decimals for mask / layer signature equality (~11 m at equator). */
export const MODEL_POSITION_QUANTIZE_DECIMALS = 4;

/** Lng/lat decimals accepted by admin geo-map create/update DTOs (`maxDecimalPlaces: 7`). */
export const GEO_MAP_API_COORDINATE_DECIMALS = 7;

/** Valid WGS84 ranges — also catches lng/lat pairs saved in reversed order. */
export const GEO_MAP_MAX_ABS_LONGITUDE = 180;
export const GEO_MAP_MAX_ABS_LATITUDE = 90;

/**
 * Discrete opacity steps for marker / legacy fade helpers — zoom micro-ticks
 * must not thrash React state on every frame.
 */
export const MODEL_FADE_OPACITY_STEP_COUNT = 5;

/** Zoom level delta for map control buttons. */
export const MAP_ZOOM_STEP = 1;

/** Env var name consumers/scripts can set to override the MapLibre style URL. */
export const MAP_STYLE_URL_ENV_VAR = 'NEXT_PUBLIC_MAP_STYLE_URL';

/** Free, no-API-key MapLibre style (OpenFreeMap "liberty"). */
export const DEFAULT_MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

/** Matches the Prisma `ProjectMapModel.minZoom` default. */
export const DEFAULT_MODEL_MIN_ZOOM = 14;

/**
 * Default model Rotation X (`pitchDeg`) for new admin placements and lab
 * fixtures. MapLibre Three.js custom layer (POC parity):
 * `DEFAULT_MODEL_ROTATION_X_DEG = 90`. Prisma column default stays 0 for
 * schema stability — create paths must send this value explicitly.
 */
export const GEO_MAP_DEFAULT_PITCH_DEG = 90;

export const MIN_MAP_ZOOM = 0;
export const MAX_MAP_ZOOM = 22;

/** Zoom span over which model opacity eases from floor → full after `minZoom`. */
export const MODEL_FADE_ZOOM_DELTA = 0.75;
export const MODEL_FADE_MIN_OPACITY = 0.45;

/**
 * Legacy fade window — dots stay fully opaque for discoverability; kept so
 * call sites / tests can share one constant if fade is reintroduced.
 */
export const MARKER_FADE_ZOOM_DELTA = 0.75;

/**
 * Floor opacity for dots once the 3D model is visible (kept at full so pins
 * remain findable next to GLBs).
 */
export const MARKER_DOT_MIN_OPACITY = 1;

/**
 * Bounds padding (degrees) applied around the current viewport so objects just
 * outside the visible frame still resolve as visible while panning.
 * Markers are cheap (DOM), so they get a generous margin; GLB models are
 * expensive to load, so their margin is tight to cap concurrent loads.
 */
export const MARKER_BOUNDS_PADDING_DEGREES = 0.5;
export const MODEL_BOUNDS_PADDING_DEGREES = 0.05;

/**
 * Positioning root of the HTML marker (`utilities-geo-map.css`).
 *
 * MapLibre owns this element's `transform` (anchor translate + screen position)
 * and its own `maplibregl-marker` classes, so the root must never carry
 * transform/scale utilities, transform transitions, or a full `className`
 * rewrite — otherwise pins drift away from their coordinates. Visual state
 * lives on the Lucide pin SVG (`.geo-map-pin__shape`).
 */
export const MARKER_ELEMENT_CLASS_NAME = 'geo-map-pin';

/** Grab cursors while the admin editor allows dragging pins. */
export const MARKER_ELEMENT_EDITABLE_CLASS_NAME = 'geo-map-pin--editable';

/**
 * Extra zoom above an object's `minZoom` when focusing so the GLB is clearly
 * past the marker→model threshold.
 */
export const FOCUS_ZOOM_ABOVE_MIN = 1.25;

/** MapLibre `flyTo` duration for focus requests (ms). */
export const FOCUS_FLY_TO_DURATION_MS = 1600;

/** Camera pitch applied on focus — kept identical to the default pitched view. */
export const FOCUS_PITCH_DEG = DEFAULT_MAP_PITCH_DEG;

/** Marker root class applied while `highlightedObjectId` matches (selected pin). */
export const MARKER_ELEMENT_SELECTED_CLASS_NAME = 'geo-map-pin--selected';

/** Info card logo slot edge length (px) — matches Tailwind `size-11`. */
export const GEO_MAP_INFO_CARD_LOGO_PX = 44;

/** Pin height (px) — keeps the hover card clear of the marker artwork. */
export const MARKER_PIN_HEIGHT_PX = 40;

/** Hover card geometry used to place it next to a pin without overflowing the map. */
export const GEO_MAP_INFO_CARD_WIDTH_PX = 300;
export const GEO_MAP_INFO_CARD_ESTIMATED_HEIGHT_PX = 80;
export const GEO_MAP_INFO_CARD_PIN_GAP_PX = 8;
export const GEO_MAP_INFO_CARD_EDGE_MARGIN_PX = 12;

/**
 * Grace period before the hover card closes after the pointer leaves a pin /
 * card — long enough to cross the pin gap and click the card action.
 */
export const GEO_MAP_HOVER_CARD_CLOSE_DELAY_MS = 550;

/**
 * Invisible hit-area between card and pin (Tailwind `h-3`). Covers
 * {@link GEO_MAP_INFO_CARD_PIN_GAP_PX} with a small cushion — avoids covering the
 * pin itself (which would steal hit-testing and fire a spurious leave).
 */
export const GEO_MAP_INFO_CARD_HOVER_BRIDGE_PX = 12;

/** Stack admin map UI above MapLibre canvas (see `GeoMapCanvas` UI overlay root). */
export const GEO_MAP_UI_OVERLAY_Z_INDEX_CLASS = 'z-[100]';

/** Context menu above the floating selection bar within the map UI overlay. */
export const GEO_MAP_ADMIN_CONTEXT_MENU_Z_INDEX_CLASS = 'z-[110]';

/** OpenFreeMap liberty layer that provides surrounding OSM building extrusions. */
export const OSM_BUILDING_EXTRUSION_LAYER_ID = 'building-3d';
export const OSM_BUILDING_FILL_LAYER_ID = 'building';
export const OSM_BUILDING_EXTRUSION_MIN_ZOOM = 15;

/**
 * Hide OSM `building-3d` fill-extrusions under published GLB anchors.
 * Prefer feature `id` / `osm_id` scoped by distance; bare distance is a
 * last-resort fallback only.
 */
export const MODEL_FOOTPRINT_SOURCE_ID = 'geo-map-model-footprints';
export const MODEL_FOOTPRINT_MASK_LAYER_ID = 'geo-map-model-footprint-mask';
/**
 * Last-resort radius when a placement has no feature/osm identity (meters).
 * Keep tight — a large radius previously wiped whole city blocks.
 */
export const MODEL_FOOTPRINT_MASK_RADIUS_METERS = 12;
/**
 * Identity matches (feature id / osm_id) only hide buildings within this
 * radius of the placement anchor. Public tiles reuse MVT feature ids across
 * tiles, so an unscoped id filter removed random buildings on other streets.
 */
export const OSM_BUILDING_HIDE_SCOPE_RADIUS_METERS = 120;
/** N-gon segment count for circular footprint helpers / tests. */
export const MODEL_FOOTPRINT_MASK_SEGMENT_COUNT = 24;

/** GeoJSON restoration of MultiPolygon sibling rings after parent feature hide. */
export const PRESERVED_OSM_PARTS_SOURCE_ID = 'geo-map-preserved-osm-parts';
export const PRESERVED_OSM_PARTS_LAYER_ID = 'geo-map-preserved-osm-parts';
