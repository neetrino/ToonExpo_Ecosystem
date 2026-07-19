"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

import { getPortalAnalyticsOverview } from "@/features/builder/api/portal-analytics-api";
import { portalAnalyticsQueryKey } from "@/features/builder/constants";
import { resolveAnalyticsDateRange } from "@/features/analytics/utils/resolve-analytics-date-range";

export const usePortalAnalyticsOverviewQuery = () => {
  const searchParams = useSearchParams();
  const range = resolveAnalyticsDateRange(searchParams.get("preset"));

  return useQuery({
    queryKey: portalAnalyticsQueryKey(range.from, range.to),
    queryFn: () =>
      getPortalAnalyticsOverview({ from: range.from, to: range.to }),
  });
};
