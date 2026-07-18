import type { PortalAnalyticsOverview } from "@toonexpo/contracts";

import { apiFetch } from "@/shared/api/client";

export type PortalAnalyticsOverviewParams = {
  from: string;
  to: string;
};

export const getPortalAnalyticsOverview = (
  params: PortalAnalyticsOverviewParams,
): Promise<PortalAnalyticsOverview> => {
  const search = new URLSearchParams({
    from: params.from,
    to: params.to,
  });

  return apiFetch<PortalAnalyticsOverview>({
    path: `/portal/analytics/overview?${search.toString()}`,
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
};
