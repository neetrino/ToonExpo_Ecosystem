"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

import { getAdminAnalyticsOverview } from "@/features/admin/api/admin-analytics-api";
import {
  adminAnalyticsQueryKey,
} from "@/features/admin/constants";
import { resolveAnalyticsDateRange } from "@/features/analytics/utils/resolve-analytics-date-range";

export const useAdminAnalyticsOverviewQuery = () => {
  const searchParams = useSearchParams();
  const range = resolveAnalyticsDateRange(searchParams.get("preset"));

  return useQuery({
    queryKey: adminAnalyticsQueryKey(range.from, range.to),
    queryFn: () =>
      getAdminAnalyticsOverview({ from: range.from, to: range.to }),
  });
};
