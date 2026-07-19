import type { BuyerCheckInStatusResponse } from "@toonexpo/contracts";

import { apiFetch } from "@/shared/api/client";

/**
 * GET /buyer/checkin — active event status and past check-in history.
 */
export const getBuyerCheckInStatus = (): Promise<BuyerCheckInStatusResponse> =>
  apiFetch({
    path: "/buyer/checkin",
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
