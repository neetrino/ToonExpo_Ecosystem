import type { PortalReadinessResponse } from "@toonexpo/contracts";

import { apiFetch } from "@/shared/api/client";

/**
 * Fetches builder-visible readiness assessments for the current company.
 */
export const getPortalReadiness = (): Promise<PortalReadinessResponse> =>
  apiFetch<PortalReadinessResponse>({
    path: "/portal/readiness",
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
