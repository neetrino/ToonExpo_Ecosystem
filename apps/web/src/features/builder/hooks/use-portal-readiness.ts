"use client";

import { useQuery } from "@tanstack/react-query";

import { getPortalReadiness } from "@/features/builder/api/portal-readiness-api";
import { PORTAL_READINESS_QUERY_KEY } from "@/features/builder/constants";

/**
 * Builder portal readiness summary (filtered server-side).
 */
export const usePortalReadinessQuery = () =>
  useQuery({
    queryKey: PORTAL_READINESS_QUERY_KEY,
    queryFn: getPortalReadiness,
  });
