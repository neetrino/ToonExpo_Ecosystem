/** TanStack Query key root for the authenticated catalog price overlay. */
export const CATALOG_PRICES_QUERY_KEY = ['catalog', 'prices'] as const;

/** Public exhibitors tab catalogs (builders + partner types). */
export const EXHIBITOR_CATALOG_QUERY_KEY = ['catalog', 'exhibitors'] as const;

/** Debounce before exhibitors keyword search updates the URL. */
export const EXHIBITOR_SEARCH_DEBOUNCE_MS = 300;

/** Max project ids per bulk price-range overlay request (matches NestJS cap). */
export const CATALOG_PRICES_BATCH_LIMIT = 50;

/** Debounce for apartments list→map hover sync (avoids camera jitter). */
export const BUY_APARTMENTS_MAP_HOVER_DEBOUNCE_MS = 80;

/** Compact QR in catalog entity modals (px). */
export const CATALOG_ENTITY_QR_SIZE_PX = 280;
