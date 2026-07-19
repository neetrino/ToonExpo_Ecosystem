import type {
  CreatePortalProjectRequest,
  PortalProjectDetail,
  PortalProjectListResponse,
  ProjectQrResponse,
  UpdatePortalProjectRequest,
  UpdatePortalPublicationRequest,
} from '@toonexpo/contracts';

import { apiFetch } from '@/shared/api/client';

import {
  catalogPath,
  jsonCredentials,
  withPortalCookie,
  type PortalRequestOptions,
} from './portal-request';

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
        path: `${catalogPath('/portal/projects', options)}?${params.toString()}`,
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
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
        path: catalogPath(`/portal/projects/${encodeURIComponent(id)}`, options),
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      },
      options.cookieHeader,
    ),
  );

/**
 * Creates a draft project.
 */
export const createPortalProject = (
  body: CreatePortalProjectRequest,
  options: PortalRequestOptions = {},
): Promise<PortalProjectDetail> =>
  apiFetch<PortalProjectDetail>({
    path: catalogPath('/portal/projects', options),
    method: 'POST',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/**
 * Patches project fields and translations.
 */
export const updatePortalProject = (
  id: string,
  body: UpdatePortalProjectRequest,
  options: PortalRequestOptions = {},
): Promise<PortalProjectDetail> =>
  apiFetch<PortalProjectDetail>({
    path: catalogPath(`/portal/projects/${encodeURIComponent(id)}`, options),
    method: 'PATCH',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/**
 * Changes project publication status (company_admin).
 */
export const updatePortalProjectPublication = (
  id: string,
  body: UpdatePortalPublicationRequest,
  options: PortalRequestOptions = {},
): Promise<PortalProjectDetail> =>
  apiFetch<PortalProjectDetail>({
    path: catalogPath(`/portal/projects/${encodeURIComponent(id)}/publication`, options),
    method: 'PATCH',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/**
 * Deletes a draft project (company_admin).
 */
export const deletePortalProject = (
  id: string,
  options: PortalRequestOptions = {},
): Promise<void> =>
  apiFetch<void>({
    path: catalogPath(`/portal/projects/${encodeURIComponent(id)}`, options),
    method: 'DELETE',
    credentials: 'include',
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
        path: catalogPath(`/portal/projects/${encodeURIComponent(projectId)}/qr`, options),
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      },
      options.cookieHeader,
    ),
  );
