"use client";

import { useQuery } from "@tanstack/react-query";

import { getBuyerCheckInStatus } from "@/features/buyer/api/buyer-checkin-api";
import { BUYER_CHECKIN_QUERY_KEY } from "@/features/buyer/constants";

/**
 * Buyer check-in status for the profile check-in page.
 */
export const useBuyerCheckInQuery = (enabled = true) =>
  useQuery({
    queryKey: BUYER_CHECKIN_QUERY_KEY,
    queryFn: () => getBuyerCheckInStatus(),
    enabled,
  });
