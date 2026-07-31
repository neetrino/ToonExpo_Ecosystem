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
export const SCENEGRAPH_SIZE_MIN_PIXELS = 12;

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
  'bg-surface-elevated px-2 py-1 text-xs font-medium text-ink shadow-sm';

export const MARKER_ELEMENT_EDITABLE_CLASS_NAME = 'cursor-grab active:cursor-grabbing';

export const NAVIGATION_CONTROL_POSITION = 'top-right';
