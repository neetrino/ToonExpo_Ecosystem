import type {
  AdminApartmentListResponse,
  AdminBuildingInventoryGlance,
  AdminBuildingListResponse,
  AdminFloorListResponse,
} from '@toonexpo/contracts';

import { apiFetch } from '@/shared/api/client';

import { catalogPath, type PortalRequestOptions } from './portal-request';

export type ListPortalInventoryParams = {
  page: number;
  pageSize: number;
  buildingId?: string;
  projectId?: string;
  search?: string;
};

const toSearch = (params: ListPortalInventoryParams): string => {
  const search = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
  });
  if (params.buildingId) {
    search.set('buildingId', params.buildingId);
  }
  if (params.projectId) {
    search.set('projectId', params.projectId);
  }
  const needle = params.search?.trim();
  if (needle) {
    search.set('search', needle);
  }
  return search.toString();
};

/**
 * Paginated company buildings for the builder buildings hub.
 */
export const listPortalInventoryBuildings = (
  params: ListPortalInventoryParams,
  options: PortalRequestOptions = {},
): Promise<AdminBuildingListResponse> =>
  apiFetch<AdminBuildingListResponse>({
    path: catalogPath(`/portal/buildings?${toSearch(params)}`, options),
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

/**
 * Paginated company floors for the builder floors hub.
 */
export const listPortalInventoryFloors = (
  params: ListPortalInventoryParams,
  options: PortalRequestOptions = {},
): Promise<AdminFloorListResponse> =>
  apiFetch<AdminFloorListResponse>({
    path: catalogPath(`/portal/floors?${toSearch(params)}`, options),
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

/**
 * Paginated company apartments for the builder apartments hub.
 */
export const listPortalInventoryApartments = (
  params: ListPortalInventoryParams,
  options: PortalRequestOptions = {},
): Promise<AdminApartmentListResponse> =>
  apiFetch<AdminApartmentListResponse>({
    path: catalogPath(`/portal/apartments?${toSearch(params)}`, options),
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

/**
 * Inventory-at-a-glance for one owned building.
 */
export const getPortalBuildingInventoryGlance = (
  buildingId: string,
  options: PortalRequestOptions = {},
): Promise<AdminBuildingInventoryGlance> =>
  apiFetch<AdminBuildingInventoryGlance>({
    path: catalogPath(
      `/portal/buildings/${encodeURIComponent(buildingId)}/inventory-glance`,
      options,
    ),
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });
