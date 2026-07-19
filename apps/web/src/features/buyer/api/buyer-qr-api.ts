import type {
  BuyerQrResponse,
  BuyerQrScanHistoryResponse,
} from "@toonexpo/contracts";

import { apiFetch, type ApiFetchOptions } from "@/shared/api/client";

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
 * GET /buyer/qr — permanent buyer QR payload for rendering.
 */
export const getBuyerQr = (
  cookieHeader?: string,
): Promise<BuyerQrResponse> =>
  apiFetch(
    withCookie(
      {
        path: "/buyer/qr",
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
      cookieHeader,
    ),
  );

/**
 * GET /buyer/qr/scans — scan history for the buyer's QR.
 */
export const getBuyerQrScans = (
  cookieHeader?: string,
): Promise<BuyerQrScanHistoryResponse> =>
  apiFetch(
    withCookie(
      {
        path: "/buyer/qr/scans",
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
      cookieHeader,
    ),
  );
