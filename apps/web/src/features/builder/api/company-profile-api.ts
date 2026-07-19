import type {
  CompanyProfileResponse,
  UpdateCompanyProfileRequest,
} from "@toonexpo/contracts";

import { apiFetch } from "@/shared/api/client";

import {
  jsonCredentials,
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

/**
 * Updates the authenticated company profile (company_admin).
 */
export const updateCompanyProfile = (
  body: UpdateCompanyProfileRequest,
): Promise<CompanyProfileResponse> =>
  apiFetch<CompanyProfileResponse>({
    path: "/company/me",
    method: "PATCH",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });
