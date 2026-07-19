"use client";

import { useQuery } from "@tanstack/react-query";

import { getAdminEventCheckInSummary } from "@/features/exhibition/api/admin-exhibition-api";
import { adminEventCheckInSummaryQueryKey } from "@/features/exhibition/constants";

export const useAdminEventCheckInSummaryQuery = (id: string) =>
  useQuery({
    queryKey: adminEventCheckInSummaryQueryKey(id),
    queryFn: () => getAdminEventCheckInSummary(id),
    enabled: id.length > 0,
  });
