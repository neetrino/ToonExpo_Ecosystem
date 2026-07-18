import type { AdminAnalyticsOverview } from "@toonexpo/contracts";

import { apiFetch } from "@/shared/api/client";

export type AdminAnalyticsOverviewParams = {
  from: string;
  to: string;
};

export const getAdminAnalyticsOverview = (
  params: AdminAnalyticsOverviewParams,
): Promise<AdminAnalyticsOverview> => {
  const search = new URLSearchParams({
    from: params.from,
    to: params.to,
  });

  return apiFetch<AdminAnalyticsOverview>({
    path: `/admin/analytics/overview?${search.toString()}`,
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
};
