"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getProjectPriceRangesOverlay,
  getProjectPricesOverlay,
} from "@/features/catalog/api/catalog-prices-api";
import { CATALOG_PRICES_QUERY_KEY } from "@/features/catalog/constants";

/**
 * Full authenticated price overlay for one project detail scope.
 * Callers must pass `enabled: false` for anonymous sessions (no request).
 */
export const useProjectPricesOverlayQuery = (
  projectId: string,
  enabled: boolean,
) =>
  useQuery({
    queryKey: [...CATALOG_PRICES_QUERY_KEY, "project", projectId],
    queryFn: () => getProjectPricesOverlay(projectId),
    enabled,
  });

/**
 * Authenticated min/max ranges for project list cards.
 * Callers must pass `enabled: false` for anonymous sessions (no request).
 */
export const useProjectPriceRangesOverlayQuery = (
  projectIds: string[],
  enabled: boolean,
) =>
  useQuery({
    queryKey: [...CATALOG_PRICES_QUERY_KEY, "ranges", projectIds.join(",")],
    queryFn: () => getProjectPriceRangesOverlay(projectIds),
    enabled: enabled && projectIds.length > 0,
  });
