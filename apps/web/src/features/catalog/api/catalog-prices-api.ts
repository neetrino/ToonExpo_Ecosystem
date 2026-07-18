import type {
  ProjectPriceRangeOverlayListResponse,
  ProjectPricesOverlay,
} from "@toonexpo/contracts";

import { apiFetch } from "@/shared/api/client";

/**
 * Session-authenticated price overlay endpoints. Always `credentials: "include"`
 * + `no-store`: this data is private and must never enter the shared Next cache.
 */
const privateGet = {
  method: "GET" as const,
  credentials: "include" as const,
  cache: "no-store" as const,
};

/**
 * GET /catalog/projects/:id/prices — logged-in range + visible_after_login
 * apartment prices for one published project.
 */
export const getProjectPricesOverlay = (
  projectId: string,
): Promise<ProjectPricesOverlay> =>
  apiFetch({
    path: `/catalog/projects/${encodeURIComponent(projectId)}/prices`,
    ...privateGet,
  });

/**
 * GET /catalog/projects/prices?ids=... — logged-in min/max ranges for
 * project list cards.
 */
export const getProjectPriceRangesOverlay = (
  projectIds: string[],
): Promise<ProjectPriceRangeOverlayListResponse> => {
  const params = new URLSearchParams({ ids: projectIds.join(",") });
  return apiFetch({
    path: `/catalog/projects/prices?${params.toString()}`,
    ...privateGet,
  });
};
