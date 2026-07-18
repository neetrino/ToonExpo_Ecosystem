import type {
  CreatePortalBuildingRequest,
  PortalBuildingSummary,
  UpdatePortalBuildingRequest,
  UpdatePortalPublicationRequest,
} from "@toonexpo/contracts";

import { apiFetch } from "@/shared/api/client";

import { jsonCredentials } from "./portal-request";

/**
 * Lists buildings for a portal project.
 */
export const listPortalBuildings = (
  projectId: string,
): Promise<PortalBuildingSummary[]> =>
  apiFetch<PortalBuildingSummary[]>({
    path: `/portal/projects/${encodeURIComponent(projectId)}/buildings`,
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

/**
 * Creates a building under a project.
 */
export const createPortalBuilding = (
  projectId: string,
  body: CreatePortalBuildingRequest,
): Promise<PortalBuildingSummary> =>
  apiFetch<PortalBuildingSummary>({
    path: `/portal/projects/${encodeURIComponent(projectId)}/buildings`,
    method: "POST",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/**
 * Patches a building.
 */
export const updatePortalBuilding = (
  id: string,
  body: UpdatePortalBuildingRequest,
): Promise<PortalBuildingSummary> =>
  apiFetch<PortalBuildingSummary>({
    path: `/portal/buildings/${encodeURIComponent(id)}`,
    method: "PATCH",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/**
 * Changes building publication status (company_admin).
 */
export const updatePortalBuildingPublication = (
  id: string,
  body: UpdatePortalPublicationRequest,
): Promise<PortalBuildingSummary> =>
  apiFetch<PortalBuildingSummary>({
    path: `/portal/buildings/${encodeURIComponent(id)}/publication`,
    method: "PATCH",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/**
 * Deletes a draft building (company_admin).
 */
export const deletePortalBuilding = (id: string): Promise<void> =>
  apiFetch<void>({
    path: `/portal/buildings/${encodeURIComponent(id)}`,
    method: "DELETE",
    credentials: "include",
  });
