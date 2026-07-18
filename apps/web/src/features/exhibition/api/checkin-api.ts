import type {
  ActiveEventResponse,
  CheckInScanRequest,
  CheckInScanResponse,
  RecentCheckInResponse,
} from "@toonexpo/contracts";

import { apiFetch } from "@/shared/api/client";
import { ApiError, isApiErrorStatus } from "@/shared/api/errors";

const jsonCredentials = {
  credentials: "include" as const,
  headers: { "Content-Type": "application/json" },
};

export type CheckinRequestOptions = {
  cookieHeader?: string | undefined;
};

const withCookie = (
  options: Parameters<typeof apiFetch>[0],
  cookieHeader?: string,
): Parameters<typeof apiFetch>[0] => {
  if (!cookieHeader) {
    return options;
  }
  return {
    ...options,
    headers: {
      ...(options.headers as Record<string, string> | undefined),
      Cookie: cookieHeader,
    },
  };
};

/**
 * Returns the active exhibition event for entrance staff, or null when none.
 */
export const getCheckinActiveEvent = async (
  options: CheckinRequestOptions = {},
): Promise<ActiveEventResponse | null> => {
  try {
    return await apiFetch<ActiveEventResponse>(
      withCookie(
        {
          path: "/checkin/active-event",
          method: "GET",
          credentials: "include",
          cache: "no-store",
        },
        options.cookieHeader,
      ),
    );
  } catch (error) {
    if (isApiErrorStatus(error, 404)) {
      return null;
    }
    throw error;
  }
};

/**
 * Scans a buyer QR token for event check-in.
 */
export const postCheckinScan = (
  body: CheckInScanRequest,
): Promise<CheckInScanResponse> =>
  apiFetch<CheckInScanResponse>({
    path: "/checkin/scan",
    method: "POST",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/**
 * Lists recent check-ins recorded by the current staff user.
 */
export const getCheckinRecent = (
  eventId: string,
  options: CheckinRequestOptions = {},
): Promise<RecentCheckInResponse> =>
  apiFetch<RecentCheckInResponse>(
    withCookie(
      {
        path: `/checkin/recent?${new URLSearchParams({ eventId }).toString()}`,
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
      options.cookieHeader,
    ),
  );

export { ApiError, isApiErrorStatus };
