"use client";

import type { ProjectListItem } from "@toonexpo/contracts";
import type { ReactNode } from "react";
import { useMemo } from "react";

import { FavoritesStatusProvider } from "@/features/buyer/components/favorites-status-provider";
import type { FavoriteTarget } from "@/features/buyer/utils/favorite-target-key";

type CatalogFavoritesScopeProps = {
  projects?: ProjectListItem[] | undefined;
  extraTargets?: FavoriteTarget[] | undefined;
  children: ReactNode;
};

/**
 * Wraps catalog sections with one batch favorites status query per page slice.
 */
export const CatalogFavoritesScope = ({
  projects = [],
  extraTargets = [],
  children,
}: CatalogFavoritesScopeProps) => {
  const targets = useMemo<FavoriteTarget[]>(
    () => [
      ...projects.map((project) => ({
        targetType: "project" as const,
        targetId: project.id,
      })),
      ...extraTargets,
    ],
    [extraTargets, projects],
  );

  return (
    <FavoritesStatusProvider targets={targets}>{children}</FavoritesStatusProvider>
  );
};
