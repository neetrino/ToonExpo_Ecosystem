import type {
  CreatePortalFloorRequest,
  PortalFloorSummary,
  UpdatePortalFloorRequest,
  UpdatePortalPublicationRequest,
} from "@toonexpo/contracts";

import { apiFetch } from "@/shared/api/client";

import { jsonCredentials } from "./portal-request";

/**
 * Lists floors for a building.
 */
export const listPortalFloors = (
  buildingId: string,
): Promise<PortalFloorSummary[]> =>
  apiFetch<PortalFloorSummary[]>({
    path: `/portal/buildings/${encodeURIComponent(buildingId)}/floors`,
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

/**
 * Creates a floor under a building.
 */
export const createPortalFloor = (
  buildingId: string,
  body: CreatePortalFloorRequest,
): Promise<PortalFloorSummary> =>
  apiFetch<PortalFloorSummary>({
    path: `/portal/buildings/${encodeURIComponent(buildingId)}/floors`,
    method: "POST",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/**
 * Patches a floor.
 */
export const updatePortalFloor = (
  id: string,
  body: UpdatePortalFloorRequest,
): Promise<PortalFloorSummary> =>
  apiFetch<PortalFloorSummary>({
    path: `/portal/floors/${encodeURIComponent(id)}`,
    method: "PATCH",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/**
 * Changes floor publication status (company_admin).
 */
export const updatePortalFloorPublication = (
  id: string,
  body: UpdatePortalPublicationRequest,
): Promise<PortalFloorSummary> =>
  apiFetch<PortalFloorSummary>({
    path: `/portal/floors/${encodeURIComponent(id)}/publication`,
    method: "PATCH",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/**
 * Deletes a draft floor (company_admin).
 */
export const deletePortalFloor = (id: string): Promise<void> =>
  apiFetch<void>({
    path: `/portal/floors/${encodeURIComponent(id)}`,
    method: "DELETE",
    credentials: "include",
  });
