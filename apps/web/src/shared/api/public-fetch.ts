import type { ApiFetchOptions } from "@/shared/api/client";
import {
  PUBLIC_CACHE_TAG,
  PUBLIC_CACHE_TTL_CATALOG_SECONDS,
  PUBLIC_CACHE_TTL_PARTNERS_SECONDS,
  catalogProjectCacheTag,
} from "@/shared/config/constants";

type PublicFetchInit = Pick<ApiFetchOptions, "method" | "next"> & {
  method: "GET";
};

/**
 * Anonymous public GET for Next Data Cache.
 * Never attach cookies/credentials — shared cache must stay non-personalized.
 */
export const publicCachedGet = (
  revalidateSeconds: number,
  tags: string[],
): PublicFetchInit => ({
  method: "GET",
  next: { revalidate: revalidateSeconds, tags },
});

export const catalogListFetch = (): PublicFetchInit =>
  publicCachedGet(PUBLIC_CACHE_TTL_CATALOG_SECONDS, [PUBLIC_CACHE_TAG.CATALOG]);

export const catalogProjectFetch = (projectId: string): PublicFetchInit =>
  publicCachedGet(PUBLIC_CACHE_TTL_CATALOG_SECONDS, [
    PUBLIC_CACHE_TAG.CATALOG,
    catalogProjectCacheTag(projectId),
  ]);

export const partnersFetch = (): PublicFetchInit =>
  publicCachedGet(PUBLIC_CACHE_TTL_PARTNERS_SECONDS, [
    PUBLIC_CACHE_TAG.PARTNERS,
  ]);

export const mortgageFetch = (): PublicFetchInit =>
  publicCachedGet(PUBLIC_CACHE_TTL_PARTNERS_SECONDS, [
    PUBLIC_CACHE_TAG.MORTGAGE,
  ]);

export const exhibitionFetch = (): PublicFetchInit =>
  publicCachedGet(PUBLIC_CACHE_TTL_CATALOG_SECONDS, [
    PUBLIC_CACHE_TAG.EXHIBITION,
  ]);

export const visualMapFetch = (): PublicFetchInit =>
  publicCachedGet(PUBLIC_CACHE_TTL_CATALOG_SECONDS, [
    PUBLIC_CACHE_TAG.VISUAL_MAP,
  ]);
