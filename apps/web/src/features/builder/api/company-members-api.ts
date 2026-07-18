import type {
  CompanyMemberListResponse,
  CompanyMemberResponse,
  InviteCompanyMemberRequest,
  UpdateCompanyMemberRequest,
} from "@toonexpo/contracts";

import { apiFetch } from "@/shared/api/client";

import {
  jsonCredentials,
  withPortalCookie,
  type PortalRequestOptions,
} from "./portal-request";

/**
 * Lists company members (any active company member; mutations require admin).
 */
export const listCompanyMembers = (
  page: number,
  pageSize: number,
  options: PortalRequestOptions = {},
): Promise<CompanyMemberListResponse> => {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  return apiFetch<CompanyMemberListResponse>(
    withPortalCookie(
      {
        path: `/company/members?${params.toString()}`,
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
      options.cookieHeader,
    ),
  );
};

/**
 * Invites a company member and sends set-password email.
 */
export const inviteCompanyMember = (
  body: InviteCompanyMemberRequest,
): Promise<CompanyMemberResponse> =>
  apiFetch<CompanyMemberResponse>({
    path: "/company/members",
    method: "POST",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/**
 * Updates member role and/or status.
 */
export const updateCompanyMember = (
  id: string,
  body: UpdateCompanyMemberRequest,
): Promise<CompanyMemberResponse> =>
  apiFetch<CompanyMemberResponse>({
    path: `/company/members/${encodeURIComponent(id)}`,
    method: "PATCH",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });
