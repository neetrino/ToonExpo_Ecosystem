import type {
  BoothSearchResponse,
  CurrentEventResponse,
  PublicBoothDetail,
  PublicBoothListResponse,
  PublicEntranceNodeListResponse,
  RoutePathResponse,
} from "@toonexpo/contracts";

import { apiFetch } from "@/shared/api/client";
import { ApiError, isApiErrorStatus } from "@/shared/api/errors";
import { exhibitionFetch } from "@/shared/api/public-fetch";

/**
 * Private / side-effect GETs stay uncached (TanStack client + booth analytics).
 */
const PRIVATE_GET_INIT = {
  method: "GET" as const,
  cache: "no-store" as const,
};

/**
 * Returns the current published active event with venue maps, or null.
 */
export const getPublicCurrentEvent = async (): Promise<CurrentEventResponse | null> => {
  try {
    return await apiFetch<CurrentEventResponse>({
      path: "/events/current",
      ...exhibitionFetch(),
    });
  } catch (error) {
    if (isApiErrorStatus(error, 404)) {
      return null;
    }
    throw error;
  }
};

/**
 * Lists published booths on a venue map.
 */
export const getPublicVenueMapBooths = (
  mapId: string,
  locale: string,
): Promise<PublicBoothListResponse> => {
  const params = new URLSearchParams({ locale });
  return apiFetch<PublicBoothListResponse>({
    path: `/venue-maps/${encodeURIComponent(mapId)}/booths?${params.toString()}`,
    ...exhibitionFetch(),
  });
};

/**
 * Searches booths on a venue map (uncached — query-specific, client-driven).
 */
export const searchPublicVenueMapBooths = (
  mapId: string,
  query: string,
  locale: string,
): Promise<BoothSearchResponse> => {
  const params = new URLSearchParams({ q: query, locale });
  return apiFetch<BoothSearchResponse>({
    path: `/venue-maps/${encodeURIComponent(mapId)}/search?${params.toString()}`,
    ...PRIVATE_GET_INIT,
  });
};

/**
 * Loads a published booth detail. Uncached — API records booth_selected analytics.
 */
export const getPublicBooth = (
  boothId: string,
  locale: string,
): Promise<PublicBoothDetail> => {
  const params = new URLSearchParams({ locale });
  return apiFetch<PublicBoothDetail>({
    path: `/booths/${encodeURIComponent(boothId)}?${params.toString()}`,
    ...PRIVATE_GET_INIT,
  });
};

/**
 * Lists entrance route nodes on a published venue map.
 */
export const getPublicVenueMapEntranceNodes = (
  mapId: string,
): Promise<PublicEntranceNodeListResponse> =>
  apiFetch<PublicEntranceNodeListResponse>({
    path: `/venue-maps/${encodeURIComponent(mapId)}/entrance-nodes`,
    ...exhibitionFetch(),
  });

/**
 * Computes a walking path from a route node to a booth (uncached — per-request).
 */
export const getPublicVenueMapRoute = (
  mapId: string,
  fromNodeId: string,
  toBoothId: string,
): Promise<RoutePathResponse> =>
  apiFetch<RoutePathResponse>({
    path: `/venue-maps/${encodeURIComponent(mapId)}/route?${new URLSearchParams({
      fromNodeId,
      toBoothId,
    }).toString()}`,
    ...PRIVATE_GET_INIT,
  });

export { ApiError, isApiErrorStatus };
