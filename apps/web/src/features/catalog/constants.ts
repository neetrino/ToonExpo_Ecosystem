/** TanStack Query key root for the authenticated catalog price overlay. */
export const CATALOG_PRICES_QUERY_KEY = ["catalog", "prices"] as const;

/** Max project ids per bulk price-range overlay request (matches NestJS cap). */
export const CATALOG_PRICES_BATCH_LIMIT = 50;
