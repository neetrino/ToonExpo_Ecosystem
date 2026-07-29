import type {
  CreateDistrictRequest,
  CreatePortalVisualCanvasRequest,
  CreatePortalVisualHotspotRequest,
  InteractiveMappingDistrictSummary,
  InteractiveMappingProjectDetail,
  InteractiveMappingProjectListResponse,
  PortalVisualCanvasDetail,
  PortalVisualCanvasListResponse,
  PortalVisualHotspotItem,
  SetupBuildingFloorsRequest,
  SetupBuildingFloorsResponse,
  UpdateDistrictRequest,
  UpdatePortalVisualCanvasRequest,
  UpdatePortalVisualHotspotRequest,
} from '@toonexpo/contracts';

import {
  catalogPath,
  jsonCredentials,
  type PortalRequestOptions,
} from '@/features/builder/api/portal-request';
import type { CatalogScope } from '@/features/builder/catalog-scope';
import { apiFetch, type ApiFetchOptions } from '@/shared/api/client';

export type InteractiveMappingRequestOptions = {
  cookieHeader?: string | undefined;
};

const withCookie = (options: ApiFetchOptions, cookieHeader?: string): ApiFetchOptions => {
  if (!cookieHeader) {
    return options;
  }
  return {
    ...options,
    headers: {
      ...(options.headers as Record<string, string> | undefined),
      Cookie: cookieHeader,
    },
  };
};

export const adminCatalogScope = (companyId: string): CatalogScope => ({
  mode: 'admin',
  companyId,
});

const catalogOptions = (companyId: string): PortalRequestOptions => ({
  scope: adminCatalogScope(companyId),
});

/**
 * Lists interactive-mapping projects with phase progress.
 */
export const listInteractiveMappingProjects = (
  options: InteractiveMappingRequestOptions = {},
): Promise<InteractiveMappingProjectListResponse> =>
  apiFetch<InteractiveMappingProjectListResponse>(
    withCookie(
      {
        path: '/admin/interactive-mapping/projects',
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      },
      options.cookieHeader,
    ),
  );

/**
 * Loads project detail for the 4-phase wizard.
 */
export const getInteractiveMappingProject = (
  projectId: string,
  options: InteractiveMappingRequestOptions = {},
): Promise<InteractiveMappingProjectDetail> =>
  apiFetch<InteractiveMappingProjectDetail>(
    withCookie(
      {
        path: `/admin/interactive-mapping/projects/${encodeURIComponent(projectId)}`,
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      },
      options.cookieHeader,
    ),
  );

export const createInteractiveMappingDistrict = (
  projectId: string,
  body: CreateDistrictRequest,
): Promise<InteractiveMappingDistrictSummary> =>
  apiFetch<InteractiveMappingDistrictSummary>({
    path: `/admin/interactive-mapping/projects/${encodeURIComponent(projectId)}/districts`,
    method: 'POST',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const updateInteractiveMappingDistrict = (
  districtId: string,
  body: UpdateDistrictRequest,
): Promise<InteractiveMappingDistrictSummary> =>
  apiFetch<InteractiveMappingDistrictSummary>({
    path: `/admin/interactive-mapping/districts/${encodeURIComponent(districtId)}`,
    method: 'PATCH',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const deleteInteractiveMappingDistrict = (districtId: string): Promise<void> =>
  apiFetch<void>({
    path: `/admin/interactive-mapping/districts/${encodeURIComponent(districtId)}`,
    method: 'DELETE',
    credentials: 'include',
  });

export const setupBuildingFloors = (
  buildingId: string,
  body: SetupBuildingFloorsRequest,
): Promise<SetupBuildingFloorsResponse> =>
  apiFetch<SetupBuildingFloorsResponse>({
    path: `/admin/interactive-mapping/buildings/${encodeURIComponent(buildingId)}/setup-floors`,
    method: 'POST',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/** Company-scoped visual canvas helpers (admin catalog paths). */

export const listAdminProjectVisualCanvases = (
  companyId: string,
  projectId: string,
): Promise<PortalVisualCanvasListResponse> =>
  apiFetch<PortalVisualCanvasListResponse>({
    path: catalogPath(
      `/portal/projects/${encodeURIComponent(projectId)}/visual-canvases`,
      catalogOptions(companyId),
    ),
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

export const createAdminVisualCanvas = (
  companyId: string,
  projectId: string,
  body: CreatePortalVisualCanvasRequest,
): Promise<PortalVisualCanvasDetail> =>
  apiFetch<PortalVisualCanvasDetail>({
    path: catalogPath(
      `/portal/projects/${encodeURIComponent(projectId)}/visual-canvases`,
      catalogOptions(companyId),
    ),
    method: 'POST',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const getAdminVisualCanvas = (
  companyId: string,
  canvasId: string,
): Promise<PortalVisualCanvasDetail> =>
  apiFetch<PortalVisualCanvasDetail>({
    path: catalogPath(
      `/portal/visual-canvases/${encodeURIComponent(canvasId)}`,
      catalogOptions(companyId),
    ),
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

export const updateAdminVisualCanvas = (
  companyId: string,
  canvasId: string,
  body: UpdatePortalVisualCanvasRequest,
): Promise<PortalVisualCanvasDetail> =>
  apiFetch<PortalVisualCanvasDetail>({
    path: catalogPath(
      `/portal/visual-canvases/${encodeURIComponent(canvasId)}`,
      catalogOptions(companyId),
    ),
    method: 'PATCH',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const createAdminVisualHotspot = (
  companyId: string,
  canvasId: string,
  body: CreatePortalVisualHotspotRequest,
): Promise<PortalVisualHotspotItem> =>
  apiFetch<PortalVisualHotspotItem>({
    path: catalogPath(
      `/portal/visual-canvases/${encodeURIComponent(canvasId)}/hotspots`,
      catalogOptions(companyId),
    ),
    method: 'POST',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const updateAdminVisualHotspot = (
  companyId: string,
  canvasId: string,
  hotspotId: string,
  body: UpdatePortalVisualHotspotRequest,
): Promise<PortalVisualHotspotItem> =>
  apiFetch<PortalVisualHotspotItem>({
    path: catalogPath(
      `/portal/visual-canvases/${encodeURIComponent(canvasId)}/hotspots/${encodeURIComponent(hotspotId)}`,
      catalogOptions(companyId),
    ),
    method: 'PATCH',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const deleteAdminVisualHotspot = (
  companyId: string,
  canvasId: string,
  hotspotId: string,
): Promise<void> =>
  apiFetch<void>({
    path: catalogPath(
      `/portal/visual-canvases/${encodeURIComponent(canvasId)}/hotspots/${encodeURIComponent(hotspotId)}`,
      catalogOptions(companyId),
    ),
    method: 'DELETE',
    credentials: 'include',
  });
