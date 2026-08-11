/**
 * Catalog module constants.
 * ADAPTIVE VALUES — confirm with owner before production tuning.
 */

/** Default page size for public project lists. */
export const CATALOG_DEFAULT_PAGE_SIZE = 18;

/** Maximum page size clients may request. */
export const CATALOG_MAX_PAGE_SIZE = 50;

/** Minimum allowed page number (1-based). */
export const CATALOG_MIN_PAGE = 1;

/** Publication status exposed on public catalog endpoints. */
export const PUBLIC_PUBLICATION_STATUS = "published" as const;

/** Default ISO currency for Armenian inventory when aggregating prices. */
export const DEFAULT_CATALOG_CURRENCY = "AMD" as const;

/** Max project ids per authenticated price-range overlay batch (matches max page size). */
export const CATALOG_PRICES_MAX_PROJECT_IDS = CATALOG_MAX_PAGE_SIZE;

/** Cache-Control for authenticated price overlay responses (session data, never shared). */
export const CATALOG_PRICES_CACHE_CONTROL = 'private, no-store' as const;

/** Max length for public project list keyword search (`q`). */
export const CATALOG_SEARCH_Q_MAX_LENGTH = 100;

/** Max admin-curated projects on the public homepage developments band. */
export const HOME_FEATURED_PROJECT_LIMIT = 3;

/** Max admin-curated apartments on the public homepage featured listings band. */
export const HOME_FEATURED_APARTMENT_LIMIT = 6;
