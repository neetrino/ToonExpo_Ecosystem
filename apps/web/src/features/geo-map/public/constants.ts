/** TanStack Query key for `GET /geo-map/models`. */
export const PUBLIC_GEO_MAP_MODELS_QUERY_KEY = ['public', 'geo-map', 'models'] as const;

/** API path segment (no `/public` prefix — `@Public()` on Nest). */
export const PUBLIC_GEO_MAP_MODELS_PATH = '/geo-map/models';

/**
 * Full-viewport map under overlay SiteHeader + MobileBottomNav.
 * Uses svh so mobile browser chrome does not clip the canvas.
 */
export const PUBLIC_GEO_MAP_MAP_HEIGHT_CLASS = 'h-svh min-h-[22rem] sm:min-h-[28rem] lg:min-h-[36rem]';

/**
 * Camera controls top — clears fixed SiteHeader spacer (`4.5rem` + safe-area)
 * plus the usual `0.625rem` inset so the stack sits below the burger / pill.
 */
export const PUBLIC_GEO_MAP_CAMERA_CONTROLS_POSITION_CLASS =
  'top-[calc(4.5rem+env(safe-area-inset-top,0px)+0.625rem)] right-2.5';
