import type {
  CreatePortalFloorRequest,
  PortalFloorSummary,
  UpdatePortalFloorRequest,
  UpdatePortalPublicationRequest,
} from '@toonexpo/contracts';

import { apiFetch } from '@/shared/api/client';

import { catalogPath, jsonCredentials, type PortalRequestOptions } from './portal-request';

/**
 * Lists floors for a building.
 */
export const listPortalFloors = (
  buildingId: string,
  options: PortalRequestOptions = {},
): Promise<PortalFloorSummary[]> =>
  apiFetch<PortalFloorSummary[]>({
    path: catalogPath(`/portal/buildings/${encodeURIComponent(buildingId)}/floors`, options),
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

/**
 * Creates a floor under a building.
 */
export const createPortalFloor = (
  buildingId: string,
  body: CreatePortalFloorRequest,
  options: PortalRequestOptions = {},
): Promise<PortalFloorSummary> =>
  apiFetch<PortalFloorSummary>({
    path: catalogPath(`/portal/buildings/${encodeURIComponent(buildingId)}/floors`, options),
    method: 'POST',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/**
 * Patches a floor.
 */
export const updatePortalFloor = (
  id: string,
  body: UpdatePortalFloorRequest,
  options: PortalRequestOptions = {},
): Promise<PortalFloorSummary> =>
  apiFetch<PortalFloorSummary>({
    path: catalogPath(`/portal/floors/${encodeURIComponent(id)}`, options),
    method: 'PATCH',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/**
 * Changes floor publication status (company_admin).
 */
export const updatePortalFloorPublication = (
  id: string,
  body: UpdatePortalPublicationRequest,
  options: PortalRequestOptions = {},
): Promise<PortalFloorSummary> =>
  apiFetch<PortalFloorSummary>({
    path: catalogPath(`/portal/floors/${encodeURIComponent(id)}/publication`, options),
    method: 'PATCH',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/**
 * Deletes a draft floor (company_admin).
 */
export const deletePortalFloor = (id: string, options: PortalRequestOptions = {}): Promise<void> =>
  apiFetch<void>({
    path: catalogPath(`/portal/floors/${encodeURIComponent(id)}`, options),
    method: 'DELETE',
    credentials: 'include',
  });
