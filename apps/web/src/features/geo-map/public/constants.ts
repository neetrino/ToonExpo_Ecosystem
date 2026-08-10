/** TanStack Query key for `GET /geo-map/models`. */
export const PUBLIC_GEO_MAP_MODELS_QUERY_KEY = ['public', 'geo-map', 'models'] as const;

/** API path segment (no `/public` prefix — `@Public()` on Nest). */
export const PUBLIC_GEO_MAP_MODELS_PATH = '/geo-map/models';

/**
 * Full-viewport map under overlay SiteHeader + MobileBottomNav.
 * Uses svh so mobile browser chrome does not clip the canvas.
 */
export const PUBLIC_GEO_MAP_MAP_HEIGHT_CLASS = 'h-svh min-h-[22rem] sm:min-h-[28rem] lg:min-h-[36rem]';
