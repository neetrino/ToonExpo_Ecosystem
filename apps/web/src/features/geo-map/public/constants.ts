/** TanStack Query key for `GET /geo-map/models`. */
export const PUBLIC_GEO_MAP_MODELS_QUERY_KEY = ['public', 'geo-map', 'models'] as const;

/** API path segment (no `/public` prefix — `@Public()` on Nest). */
export const PUBLIC_GEO_MAP_MODELS_PATH = '/geo-map/models';

/**
 * Map panel height — clears fixed header + mobile bottom nav (matches `MobileBottomNavSpacer`).
 */
export const PUBLIC_GEO_MAP_MAP_HEIGHT_CLASS =
  'h-[calc(100svh-4.5rem-env(safe-area-inset-top,0px)-4.3125rem-max(0.4375rem,env(safe-area-inset-bottom,0px)))]' +
  ' lg:h-[calc(100svh-4.5rem-env(safe-area-inset-top,0px))]';
