import type { QrResolveResponse, ResolveQrRequest } from "@toonexpo/contracts";

import { apiFetch } from "@/shared/api/client";

/**
 * POST /qr/resolve — role-based QR token resolution (optional auth).
 */
export const resolveQrToken = (
  body: ResolveQrRequest,
): Promise<QrResolveResponse> =>
  apiFetch({
    path: "/qr/resolve",
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
