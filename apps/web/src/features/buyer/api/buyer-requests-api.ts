import type {
  BuyerRequestListResponse,
  CreateBuyerRequestBody,
  CreateDealFromScanBody,
  IntakeCreateResult,
} from "@toonexpo/contracts";

import { apiFetch, type ApiFetchOptions } from "@/shared/api/client";

const jsonCredentials = {
  credentials: "include" as const,
  headers: { "Content-Type": "application/json" },
};

const withCookie = (
  options: ApiFetchOptions,
  cookieHeader?: string,
): ApiFetchOptions => {
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
 * POST /requests — buyer project/apartment interest request.
 */
export const createBuyerRequest = (
  body: CreateBuyerRequestBody,
): Promise<IntakeCreateResult> =>
  apiFetch({
    path: "/requests",
    method: "POST",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/**
 * GET /buyer/requests — paginated buyer-facing request history.
 */
export const listBuyerRequests = (
  page: number,
  pageSize: number,
  cookieHeader?: string,
): Promise<BuyerRequestListResponse> => {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  return apiFetch(
    withCookie(
      {
        path: `/buyer/requests?${params.toString()}`,
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
      cookieHeader,
    ),
  );
};

/**
 * POST /portal/crm/deals/from-scan — builder creates deal from QR scan.
 */
export const createDealFromScan = (
  body: CreateDealFromScanBody,
): Promise<IntakeCreateResult> =>
  apiFetch({
    path: "/portal/crm/deals/from-scan",
    method: "POST",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });
