"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import { useMeQuery } from "@/features/auth/hooks/use-auth";
import { useFavoritesStatusQuery } from "@/features/buyer/hooks/use-favorites";
import { isBuyerAccount } from "@/features/buyer/utils/is-buyer-account";
import {
  buildFavoriteTargetKey,
  serializeFavoriteTargets,
} from "@/features/buyer/utils/favorite-target-key";
import type { FavoriteTarget } from "@/features/buyer/utils/favorite-target-key";

type FavoritesStatusContextValue = {
  isFavorited: (targetType: FavoriteTarget["targetType"], targetId: string) => boolean;
  isLoading: boolean;
};

const FavoritesStatusContext = createContext<FavoritesStatusContextValue | null>(
  null,
);

type FavoritesStatusProviderProps = {
  targets: FavoriteTarget[];
  children: ReactNode;
};

/**
 * Provides batch favorite status for catalog cards on a page.
 */
export const FavoritesStatusProvider = ({
  targets,
  children,
}: FavoritesStatusProviderProps) => {
  const { data: user, isLoading: authLoading } = useMeQuery();
  const enabled = isBuyerAccount(user);
  const stableTargets = useMemo(
    () =>
      [...targets].sort((left, right) =>
        serializeFavoriteTargets([left]).localeCompare(
          serializeFavoriteTargets([right]),
        ),
      ),
    [targets],
  );
  const statusQuery = useFavoritesStatusQuery(stableTargets, enabled);

  const favoritedSet = useMemo(
    () => new Set(statusQuery.data?.favorited ?? []),
    [statusQuery.data?.favorited],
  );

  const value = useMemo<FavoritesStatusContextValue>(
    () => ({
      isFavorited: (targetType, targetId) =>
        favoritedSet.has(buildFavoriteTargetKey(targetType, targetId)),
      isLoading: authLoading || (enabled && statusQuery.isLoading),
    }),
    [authLoading, enabled, favoritedSet, statusQuery.isLoading],
  );

  return (
    <FavoritesStatusContext.Provider value={value}>
      {children}
    </FavoritesStatusContext.Provider>
  );
};

export const useFavoritesStatusContext = (): FavoritesStatusContextValue | null =>
  useContext(FavoritesStatusContext);
