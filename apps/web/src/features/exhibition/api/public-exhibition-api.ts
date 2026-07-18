import type {
  BoothSearchResponse,
  CurrentEventResponse,
  PublicBoothListResponse,
  PublicEntranceNodeListResponse,
  RoutePathResponse,
} from "@toonexpo/contracts";

import { apiFetch } from "@/shared/api/client";
import { ApiError, isApiErrorStatus } from "@/shared/api/errors";

export type PublicExpoRequestOptions = {
  cookieHeader?: string | undefined;
};

const withCookie = (
  options: Parameters<typeof apiFetch>[0],
  cookieHeader?: string,
): Parameters<typeof apiFetch>[0] => {
  if (!cookieHeader) {
    return options;
  }
  return {
    ...options,
    headers: {
      ...(options.headers as Record<string, string> | undefined),
      Cookie: cookieHeader,
    },
  };
};

/**
 * Returns the current published active event with venue maps, or null.
 */
export const getPublicCurrentEvent = async (
  options: PublicExpoRequestOptions = {},
): Promise<CurrentEventResponse | null> => {
  try {
    return await apiFetch<CurrentEventResponse>(
      withCookie(
        {
          path: "/events/current",
          method: "GET",
          cache: "no-store",
        },
        options.cookieHeader,
      ),
    );
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
  options: PublicExpoRequestOptions = {},
): Promise<PublicBoothListResponse> => {
  const params = new URLSearchParams({ locale });
  return apiFetch<PublicBoothListResponse>(
    withCookie(
      {
        path: `/venue-maps/${encodeURIComponent(mapId)}/booths?${params.toString()}`,
        method: "GET",
        cache: "no-store",
      },
      options.cookieHeader,
    ),
  );
};

/**
 * Searches booths on a venue map.
 */
export const searchPublicVenueMapBooths = (
  mapId: string,
  query: string,
  locale: string,
  options: PublicExpoRequestOptions = {},
): Promise<BoothSearchResponse> => {
  const params = new URLSearchParams({ q: query, locale });
  return apiFetch<BoothSearchResponse>(
    withCookie(
      {
        path: `/venue-maps/${encodeURIComponent(mapId)}/search?${params.toString()}`,
        method: "GET",
        cache: "no-store",
      },
      options.cookieHeader,
    ),
  );
};

/**
 * Lists entrance route nodes on a published venue map.
 */
export const getPublicVenueMapEntranceNodes = (
  mapId: string,
  options: PublicExpoRequestOptions = {},
): Promise<PublicEntranceNodeListResponse> =>
  apiFetch<PublicEntranceNodeListResponse>(
    withCookie(
      {
        path: `/venue-maps/${encodeURIComponent(mapId)}/entrance-nodes`,
        method: "GET",
        cache: "no-store",
      },
      options.cookieHeader,
    ),
  );

/**
 * Computes a walking path from a route node to a booth.
 */
export const getPublicVenueMapRoute = (
  mapId: string,
  fromNodeId: string,
  toBoothId: string,
  options: PublicExpoRequestOptions = {},
): Promise<RoutePathResponse> =>
  apiFetch<RoutePathResponse>(
    withCookie(
      {
        path: `/venue-maps/${encodeURIComponent(mapId)}/route?${new URLSearchParams({
          fromNodeId,
          toBoothId,
        }).toString()}`,
        method: "GET",
        cache: "no-store",
      },
      options.cookieHeader,
    ),
  );

export { ApiError, isApiErrorStatus };
