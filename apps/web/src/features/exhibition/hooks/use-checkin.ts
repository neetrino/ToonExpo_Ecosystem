"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CheckInScanRequest } from "@toonexpo/contracts";

import {
  getCheckinActiveEvent,
  getCheckinRecent,
  postCheckinScan,
} from "@/features/exhibition/api/checkin-api";
import {
  checkinActiveEventQueryKey,
  checkinRecentQueryKey,
} from "@/features/exhibition/constants";

/**
 * Active exhibition event for the check-in scanner.
 */
export const useCheckinActiveEventQuery = () =>
  useQuery({
    queryKey: checkinActiveEventQueryKey(),
    queryFn: () => getCheckinActiveEvent(),
  });

/**
 * Recent check-ins for the active event.
 */
export const useCheckinRecentQuery = (eventId: string) =>
  useQuery({
    queryKey: checkinRecentQueryKey(eventId),
    queryFn: () => getCheckinRecent(eventId),
    enabled: eventId.length > 0,
    refetchInterval: 30_000,
  });

/**
 * Scan mutation — invalidates recent list on success.
 */
export const useCheckinScanMutation = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Omit<CheckInScanRequest, "eventId">) =>
      postCheckinScan({ ...body, eventId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: checkinRecentQueryKey(eventId),
      });
    },
  });
};
