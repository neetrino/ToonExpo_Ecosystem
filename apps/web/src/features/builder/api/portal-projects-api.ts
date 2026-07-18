import type {
  CreatePortalProjectRequest,
  PortalProjectDetail,
  PortalProjectListResponse,
  ProjectQrResponse,
  UpdatePortalProjectRequest,
  UpdatePortalPublicationRequest,
} from "@toonexpo/contracts";

import { apiFetch } from "@/shared/api/client";

import {
  jsonCredentials,
  withPortalCookie,
  type PortalRequestOptions,
} from "./portal-request";

/**
 * Lists all company projects including drafts.
 */
export const listPortalProjects = (
  page: number,
  pageSize: number,
  options: PortalRequestOptions = {},
): Promise<PortalProjectListResponse> => {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  return apiFetch<PortalProjectListResponse>(
    withPortalCookie(
      {
        path: `/portal/projects?${params.toString()}`,
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
      options.cookieHeader,
    ),
  );
};

/**
 * Fetches a portal project with buildings and floors.
 */
export const getPortalProject = (
  id: string,
  options: PortalRequestOptions = {},
): Promise<PortalProjectDetail> =>
  apiFetch<PortalProjectDetail>(
    withPortalCookie(
      {
        path: `/portal/projects/${encodeURIComponent(id)}`,
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
      options.cookieHeader,
    ),
  );

/**
 * Creates a draft project.
 */
export const createPortalProject = (
  body: CreatePortalProjectRequest,
): Promise<PortalProjectDetail> =>
  apiFetch<PortalProjectDetail>({
    path: "/portal/projects",
    method: "POST",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/**
 * Patches project fields and translations.
 */
export const updatePortalProject = (
  id: string,
  body: UpdatePortalProjectRequest,
): Promise<PortalProjectDetail> =>
  apiFetch<PortalProjectDetail>({
    path: `/portal/projects/${encodeURIComponent(id)}`,
    method: "PATCH",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/**
 * Changes project publication status (company_admin).
 */
export const updatePortalProjectPublication = (
  id: string,
  body: UpdatePortalPublicationRequest,
): Promise<PortalProjectDetail> =>
  apiFetch<PortalProjectDetail>({
    path: `/portal/projects/${encodeURIComponent(id)}/publication`,
    method: "PATCH",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/**
 * Deletes a draft project (company_admin).
 */
export const deletePortalProject = (id: string): Promise<void> =>
  apiFetch<void>({
    path: `/portal/projects/${encodeURIComponent(id)}`,
    method: "DELETE",
    credentials: "include",
  });

/**
 * Returns the public project page URL for exhibition QR printouts.
 */
export const getPortalProjectQr = (
  projectId: string,
  options: PortalRequestOptions = {},
): Promise<ProjectQrResponse> =>
  apiFetch<ProjectQrResponse>(
    withPortalCookie(
      {
        path: `/portal/projects/${encodeURIComponent(projectId)}/qr`,
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
      options.cookieHeader,
    ),
  );
