"use client";

import type { BuyerFavoritesStatusResponse } from "@toonexpo/contracts";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  addBuyerFavorite,
  getBuyerFavoritesStatus,
  listBuyerFavorites,
  removeBuyerFavorite,
} from "@/features/buyer/api/buyer-favorites-api";
import {
  BUYER_FAVORITES_QUERY_KEY,
  BUYER_FAVORITES_STATUS_QUERY_KEY,
} from "@/features/buyer/constants";
import {
  buildFavoriteTargetKey,
  serializeFavoriteTargets,
} from "@/features/buyer/utils/favorite-target-key";
import type { FavoriteTarget } from "@/features/buyer/utils/favorite-target-key";

export const buildFavoritesStatusQueryKey = (targets: FavoriteTarget[]) =>
  [...BUYER_FAVORITES_STATUS_QUERY_KEY, serializeFavoriteTargets(targets)] as const;

const patchStatusCaches = (
  queryClient: ReturnType<typeof useQueryClient>,
  targetKey: string,
  nextFavorited: boolean,
): void => {
  queryClient.setQueriesData<BuyerFavoritesStatusResponse>(
    { queryKey: BUYER_FAVORITES_STATUS_QUERY_KEY },
    (previous) => {
      if (!previous) {
        return previous;
      }

      const hasKey = previous.favorited.includes(targetKey);
      if (nextFavorited && !hasKey) {
        return { favorited: [...previous.favorited, targetKey] };
      }
      if (!nextFavorited && hasKey) {
        return {
          favorited: previous.favorited.filter((key) => key !== targetKey),
        };
      }
      return previous;
    },
  );
};

/**
 * Batch favorite status for catalog heart icons (buyer session only).
 */
export const useFavoritesStatusQuery = (
  targets: FavoriteTarget[],
  enabled = true,
) =>
  useQuery({
    queryKey: buildFavoritesStatusQueryKey(targets),
    queryFn: () => getBuyerFavoritesStatus(targets),
    enabled: enabled && targets.length > 0,
  });

/**
 * Buyer favorites list for the profile page.
 */
export const useBuyerFavoritesQuery = (locale: string, enabled = true) =>
  useQuery({
    queryKey: [...BUYER_FAVORITES_QUERY_KEY, { locale }],
    queryFn: () => listBuyerFavorites(locale),
    enabled,
  });

type ToggleFavoriteInput = FavoriteTarget & {
  favorited: boolean;
};

/**
 * Optimistic add/remove favorite with status cache rollback on error.
 */
export const useToggleFavoriteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ targetType, targetId, favorited }: ToggleFavoriteInput) =>
      favorited
        ? removeBuyerFavorite(targetType, targetId)
        : addBuyerFavorite(targetType, targetId),
    onMutate: async ({ targetType, targetId, favorited }) => {
      const targetKey = buildFavoriteTargetKey(targetType, targetId);
      await queryClient.cancelQueries({
        queryKey: BUYER_FAVORITES_STATUS_QUERY_KEY,
      });

      const snapshots = queryClient.getQueriesData<BuyerFavoritesStatusResponse>(
        { queryKey: BUYER_FAVORITES_STATUS_QUERY_KEY },
      );

      patchStatusCaches(queryClient, targetKey, !favorited);

      return { snapshots };
    },
    onError: (_error, _variables, context) => {
      context?.snapshots.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: BUYER_FAVORITES_STATUS_QUERY_KEY,
      });
      void queryClient.invalidateQueries({ queryKey: BUYER_FAVORITES_QUERY_KEY });
    },
  });
};

/**
 * Remove favorite from the profile list (no optimistic status needed).
 */
export const useRemoveFavoriteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ targetType, targetId }: FavoriteTarget) =>
      removeBuyerFavorite(targetType, targetId),
    onSuccess: (_data, { targetType, targetId }) => {
      const targetKey = buildFavoriteTargetKey(targetType, targetId);
      patchStatusCaches(queryClient, targetKey, false);
      void queryClient.invalidateQueries({ queryKey: BUYER_FAVORITES_QUERY_KEY });
      void queryClient.invalidateQueries({
        queryKey: BUYER_FAVORITES_STATUS_QUERY_KEY,
      });
    },
  });
};
