/** Public web default locale (Armenian); re-exported from shared platform constant. */
export { DEFAULT_LOCALE as WEB_DEFAULT_LOCALE } from "@toonexpo/shared";

export {
  PUBLIC_CACHE_TAG,
  PUBLIC_CACHE_TTL_CATALOG_SECONDS,
  PUBLIC_CACHE_TTL_PARTNERS_SECONDS,
  catalogProjectCacheTag,
} from "@toonexpo/shared";

/** Fallback API origin for local development when env is unset. */
export const DEFAULT_API_ORIGIN = "http://localhost:4000";

/** Health request timeout in milliseconds. */
export const HEALTH_FETCH_TIMEOUT_MS = 3_000;

/** Default TanStack Query stale time in milliseconds (1 minute). */
export const QUERY_DEFAULT_STALE_TIME_MS = 60_000;

/** Header for the infrastructure revalidate webhook (API → web). */
export const REVALIDATE_SECRET_HEADER = "x-revalidate-secret";

/**
 * Next.js 16 `revalidateTag` profile for publish purge:
 * expire immediately so the next request refetches (not SWR stale).
 */
export const REVALIDATE_TAG_EXPIRE_IMMEDIATE = { expire: 0 } as const;
