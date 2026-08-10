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

import {
  INTERACTIVE_MAPPING_ADMIN_API_PREFIX,
  INTERACTIVE_MAPPING_PORTAL_API_PREFIX,
} from '../constants';

export type InteractiveMappingApiMode = 'admin' | 'portal';

export type InteractiveMappingRequestOptions = {
  cookieHeader?: string | undefined;
  mode?: InteractiveMappingApiMode | undefined;
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

const apiPrefixFor = (mode: InteractiveMappingApiMode): string =>
  mode === 'portal' ? INTERACTIVE_MAPPING_PORTAL_API_PREFIX : INTERACTIVE_MAPPING_ADMIN_API_PREFIX;

export const adminCatalogScope = (companyId: string): CatalogScope => ({
  mode: 'admin',
  companyId,
});

const catalogOptions = (scope: CatalogScope): PortalRequestOptions => ({ scope });

/**
 * Lists interactive-mapping projects with phase progress.
 * Admin: all projects. Portal: caller's company only.
 */
export const listInteractiveMappingProjects = (
  options: InteractiveMappingRequestOptions & {
    page?: number | undefined;
    pageSize?: number | undefined;
    search?: string | undefined;
  } = {},
): Promise<InteractiveMappingProjectListResponse> => {
  const mode = options.mode ?? 'admin';
  const params = new URLSearchParams();
  if (options.page != null) {
    params.set('page', String(options.page));
  }
  if (options.pageSize != null) {
    params.set('pageSize', String(options.pageSize));
  }
  if (options.search?.trim()) {
    params.set('search', options.search.trim());
  }
  const query = params.toString();
  return apiFetch<InteractiveMappingProjectListResponse>(
    withCookie(
      {
        path: `${apiPrefixFor(mode)}/projects${query.length > 0 ? `?${query}` : ''}`,
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      },
      options.cookieHeader,
    ),
  );
};

/**
 * Loads project detail for the 4-phase wizard.
 */
export const getInteractiveMappingProject = (
  projectId: string,
  options: InteractiveMappingRequestOptions = {},
): Promise<InteractiveMappingProjectDetail> => {
  const mode = options.mode ?? 'admin';
  return apiFetch<InteractiveMappingProjectDetail>(
    withCookie(
      {
        path: `${apiPrefixFor(mode)}/projects/${encodeURIComponent(projectId)}`,
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      },
      options.cookieHeader,
    ),
  );
};

export const createInteractiveMappingDistrict = (
  projectId: string,
  body: CreateDistrictRequest,
  mode: InteractiveMappingApiMode = 'admin',
): Promise<InteractiveMappingDistrictSummary> =>
  apiFetch<InteractiveMappingDistrictSummary>({
    path: `${apiPrefixFor(mode)}/projects/${encodeURIComponent(projectId)}/districts`,
    method: 'POST',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const updateInteractiveMappingDistrict = (
  districtId: string,
  body: UpdateDistrictRequest,
  mode: InteractiveMappingApiMode = 'admin',
): Promise<InteractiveMappingDistrictSummary> =>
  apiFetch<InteractiveMappingDistrictSummary>({
    path: `${apiPrefixFor(mode)}/districts/${encodeURIComponent(districtId)}`,
    method: 'PATCH',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const deleteInteractiveMappingDistrict = (
  districtId: string,
  mode: InteractiveMappingApiMode = 'admin',
): Promise<void> =>
  apiFetch<void>({
    path: `${apiPrefixFor(mode)}/districts/${encodeURIComponent(districtId)}`,
    method: 'DELETE',
    credentials: 'include',
  });

export const setupBuildingFloors = (
  buildingId: string,
  body: SetupBuildingFloorsRequest,
  mode: InteractiveMappingApiMode = 'admin',
): Promise<SetupBuildingFloorsResponse> =>
  apiFetch<SetupBuildingFloorsResponse>({
    path: `${apiPrefixFor(mode)}/buildings/${encodeURIComponent(buildingId)}/setup-floors`,
    method: 'POST',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/** Company-scoped visual canvas helpers (portal path or admin catalog rewrite). */

export const listProjectVisualCanvases = (
  scope: CatalogScope,
  projectId: string,
): Promise<PortalVisualCanvasListResponse> =>
  apiFetch<PortalVisualCanvasListResponse>({
    path: catalogPath(
      `/portal/projects/${encodeURIComponent(projectId)}/visual-canvases`,
      catalogOptions(scope),
    ),
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

export const createVisualCanvas = (
  scope: CatalogScope,
  projectId: string,
  body: CreatePortalVisualCanvasRequest,
): Promise<PortalVisualCanvasDetail> =>
  apiFetch<PortalVisualCanvasDetail>({
    path: catalogPath(
      `/portal/projects/${encodeURIComponent(projectId)}/visual-canvases`,
      catalogOptions(scope),
    ),
    method: 'POST',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const getVisualCanvas = (
  scope: CatalogScope,
  canvasId: string,
): Promise<PortalVisualCanvasDetail> =>
  apiFetch<PortalVisualCanvasDetail>({
    path: catalogPath(
      `/portal/visual-canvases/${encodeURIComponent(canvasId)}`,
      catalogOptions(scope),
    ),
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

export const updateVisualCanvas = (
  scope: CatalogScope,
  canvasId: string,
  body: UpdatePortalVisualCanvasRequest,
): Promise<PortalVisualCanvasDetail> =>
  apiFetch<PortalVisualCanvasDetail>({
    path: catalogPath(
      `/portal/visual-canvases/${encodeURIComponent(canvasId)}`,
      catalogOptions(scope),
    ),
    method: 'PATCH',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const deleteVisualCanvas = (scope: CatalogScope, canvasId: string): Promise<void> =>
  apiFetch<void>({
    path: catalogPath(
      `/portal/visual-canvases/${encodeURIComponent(canvasId)}`,
      catalogOptions(scope),
    ),
    method: 'DELETE',
    credentials: 'include',
  });

/**
 * Removes an attached mapping image by deleting its visual canvas.
 * Published canvases are unpublished first (API allows hard-delete of drafts only).
 */
export const clearAttachedVisualCanvas = async (
  scope: CatalogScope,
  canvas: Pick<PortalVisualCanvasDetail, 'id' | 'publicationStatus'>,
): Promise<void> => {
  if (canvas.publicationStatus === 'published') {
    await updateVisualCanvas(scope, canvas.id, { publicationStatus: 'draft' });
  }
  await deleteVisualCanvas(scope, canvas.id);
};

export const createVisualHotspot = (
  scope: CatalogScope,
  canvasId: string,
  body: CreatePortalVisualHotspotRequest,
): Promise<PortalVisualHotspotItem> =>
  apiFetch<PortalVisualHotspotItem>({
    path: catalogPath(
      `/portal/visual-canvases/${encodeURIComponent(canvasId)}/hotspots`,
      catalogOptions(scope),
    ),
    method: 'POST',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const updateVisualHotspot = (
  scope: CatalogScope,
  canvasId: string,
  hotspotId: string,
  body: UpdatePortalVisualHotspotRequest,
): Promise<PortalVisualHotspotItem> =>
  apiFetch<PortalVisualHotspotItem>({
    path: catalogPath(
      `/portal/visual-canvases/${encodeURIComponent(canvasId)}/hotspots/${encodeURIComponent(hotspotId)}`,
      catalogOptions(scope),
    ),
    method: 'PATCH',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const deleteVisualHotspot = (
  scope: CatalogScope,
  canvasId: string,
  hotspotId: string,
): Promise<void> =>
  apiFetch<void>({
    path: catalogPath(
      `/portal/visual-canvases/${encodeURIComponent(canvasId)}/hotspots/${encodeURIComponent(hotspotId)}`,
      catalogOptions(scope),
    ),
    method: 'DELETE',
    credentials: 'include',
  });

/** @deprecated Prefer listProjectVisualCanvases with CatalogScope */
export const listAdminProjectVisualCanvases = (
  companyId: string,
  projectId: string,
): Promise<PortalVisualCanvasListResponse> =>
  listProjectVisualCanvases(adminCatalogScope(companyId), projectId);

/** @deprecated Prefer createVisualCanvas with CatalogScope */
export const createAdminVisualCanvas = (
  companyId: string,
  projectId: string,
  body: CreatePortalVisualCanvasRequest,
): Promise<PortalVisualCanvasDetail> =>
  createVisualCanvas(adminCatalogScope(companyId), projectId, body);

/** @deprecated Prefer getVisualCanvas with CatalogScope */
export const getAdminVisualCanvas = (
  companyId: string,
  canvasId: string,
): Promise<PortalVisualCanvasDetail> => getVisualCanvas(adminCatalogScope(companyId), canvasId);

/** @deprecated Prefer updateVisualCanvas with CatalogScope */
export const updateAdminVisualCanvas = (
  companyId: string,
  canvasId: string,
  body: UpdatePortalVisualCanvasRequest,
): Promise<PortalVisualCanvasDetail> =>
  updateVisualCanvas(adminCatalogScope(companyId), canvasId, body);

/** @deprecated Prefer createVisualHotspot with CatalogScope */
export const createAdminVisualHotspot = (
  companyId: string,
  canvasId: string,
  body: CreatePortalVisualHotspotRequest,
): Promise<PortalVisualHotspotItem> =>
  createVisualHotspot(adminCatalogScope(companyId), canvasId, body);

/** @deprecated Prefer updateVisualHotspot with CatalogScope */
export const updateAdminVisualHotspot = (
  companyId: string,
  canvasId: string,
  hotspotId: string,
  body: UpdatePortalVisualHotspotRequest,
): Promise<PortalVisualHotspotItem> =>
  updateVisualHotspot(adminCatalogScope(companyId), canvasId, hotspotId, body);

/** @deprecated Prefer deleteVisualHotspot with CatalogScope */
export const deleteAdminVisualHotspot = (
  companyId: string,
  canvasId: string,
  hotspotId: string,
): Promise<void> => deleteVisualHotspot(adminCatalogScope(companyId), canvasId, hotspotId);
