import type {
  BuyerFavoritesListResponse,
  BuyerFavoritesStatusResponse,
  FavoriteTargetType,
} from "@toonexpo/contracts";

import { serializeFavoriteTargets } from "@/features/buyer/utils/favorite-target-key";
import type { FavoriteTarget } from "@/features/buyer/utils/favorite-target-key";
import { apiFetch, type ApiFetchOptions } from "@/shared/api/client";

const jsonCredentials = {
  credentials: "include" as const,
  headers: { "Content-Type": "application/json" },
};

const withCookie = (
  options: ApiFetchOptions,
  cookieHeader?: string,
): ApiFetchOptions => {
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
 * PUT /buyer/favorites/:targetType/:targetId — idempotent add.
 */
export const addBuyerFavorite = (
  targetType: FavoriteTargetType,
  targetId: string,
): Promise<void> =>
  apiFetch({
    path: `/buyer/favorites/${targetType}/${targetId}`,
    method: "PUT",
    ...jsonCredentials,
  });

/**
 * DELETE /buyer/favorites/:targetType/:targetId — idempotent remove.
 */
export const removeBuyerFavorite = (
  targetType: FavoriteTargetType,
  targetId: string,
): Promise<void> =>
  apiFetch({
    path: `/buyer/favorites/${targetType}/${targetId}`,
    method: "DELETE",
    credentials: "include",
  });

/**
 * GET /buyer/favorites — flat favorites list with catalog card data.
 */
export const listBuyerFavorites = (
  locale: string,
  cookieHeader?: string,
): Promise<BuyerFavoritesListResponse> => {
  const params = new URLSearchParams({ locale });
  return apiFetch(
    withCookie(
      {
        path: `/buyer/favorites?${params.toString()}`,
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
      cookieHeader,
    ),
  );
};

/**
 * GET /buyer/favorites/status — batch heart status for catalog targets.
 */
export const getBuyerFavoritesStatus = (
  targets: FavoriteTarget[],
): Promise<BuyerFavoritesStatusResponse> => {
  const params = new URLSearchParams({
    targets: serializeFavoriteTargets(targets),
  });
  return apiFetch({
    path: `/buyer/favorites/status?${params.toString()}`,
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
};
