/**
 * Catalog module constants.
 * ADAPTIVE VALUES — confirm with owner before production tuning.
 */

/** Default page size for public project lists. */
export const CATALOG_DEFAULT_PAGE_SIZE = 20;

/** Maximum page size clients may request. */
export const CATALOG_MAX_PAGE_SIZE = 50;

/** Minimum allowed page number (1-based). */
export const CATALOG_MIN_PAGE = 1;

/** Publication status exposed on public catalog endpoints. */
export const PUBLIC_PUBLICATION_STATUS = "published" as const;

/** Default ISO currency for Armenian inventory when aggregating prices. */
export const DEFAULT_CATALOG_CURRENCY = "AMD" as const;
