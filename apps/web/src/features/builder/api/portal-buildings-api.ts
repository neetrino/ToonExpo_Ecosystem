import type {
  CreatePortalBuildingRequest,
  PortalBuildingSummary,
  UpdatePortalBuildingRequest,
  UpdatePortalPublicationRequest,
} from '@toonexpo/contracts';

import { apiFetch } from '@/shared/api/client';

import { catalogPath, jsonCredentials, type PortalRequestOptions } from './portal-request';

/**
 * Lists buildings for a portal project.
 */
export const listPortalBuildings = (
  projectId: string,
  options: PortalRequestOptions = {},
): Promise<PortalBuildingSummary[]> =>
  apiFetch<PortalBuildingSummary[]>({
    path: catalogPath(`/portal/projects/${encodeURIComponent(projectId)}/buildings`, options),
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

/**
 * Creates a building under a project.
 */
export const createPortalBuilding = (
  projectId: string,
  body: CreatePortalBuildingRequest,
  options: PortalRequestOptions = {},
): Promise<PortalBuildingSummary> =>
  apiFetch<PortalBuildingSummary>({
    path: catalogPath(`/portal/projects/${encodeURIComponent(projectId)}/buildings`, options),
    method: 'POST',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/**
 * Patches a building.
 */
export const updatePortalBuilding = (
  id: string,
  body: UpdatePortalBuildingRequest,
  options: PortalRequestOptions = {},
): Promise<PortalBuildingSummary> =>
  apiFetch<PortalBuildingSummary>({
    path: catalogPath(`/portal/buildings/${encodeURIComponent(id)}`, options),
    method: 'PATCH',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/**
 * Changes building publication status (company_admin).
 */
export const updatePortalBuildingPublication = (
  id: string,
  body: UpdatePortalPublicationRequest,
  options: PortalRequestOptions = {},
): Promise<PortalBuildingSummary> =>
  apiFetch<PortalBuildingSummary>({
    path: catalogPath(`/portal/buildings/${encodeURIComponent(id)}/publication`, options),
    method: 'PATCH',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/**
 * Deletes a draft building (company_admin).
 */
export const deletePortalBuilding = (
  id: string,
  options: PortalRequestOptions = {},
): Promise<void> =>
  apiFetch<void>({
    path: catalogPath(`/portal/buildings/${encodeURIComponent(id)}`, options),
    method: 'DELETE',
    credentials: 'include',
  });
