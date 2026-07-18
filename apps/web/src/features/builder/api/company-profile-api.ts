import type { CompanyProfileResponse } from "@toonexpo/contracts";

import { apiFetch } from "@/shared/api/client";

import {
  withPortalCookie,
  type PortalRequestOptions,
} from "./portal-request";

/**
 * Loads the authenticated company member's company profile and role.
 */
export const getCompanyProfile = (
  options: PortalRequestOptions = {},
): Promise<CompanyProfileResponse> =>
  apiFetch<CompanyProfileResponse>(
    withPortalCookie(
      {
        path: "/company/me",
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
      options.cookieHeader,
    ),
  );
