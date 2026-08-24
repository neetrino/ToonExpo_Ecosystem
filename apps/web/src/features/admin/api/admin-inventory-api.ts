import type {
  AdminApartmentListResponse,
  AdminBuildingInventoryGlance,
  AdminBuildingListResponse,
  AdminFloorListResponse,
  FeaturedOnHomeResponse,
} from '@toonexpo/contracts';

import {
  type AdminRequestOptions,
  type ListAdminInventoryParams,
} from '@/features/admin/api/admin-companies-api';
import { apiFetch, type ApiFetchOptions } from '@/shared/api/client';

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

const appendIdParam = (
  search: URLSearchParams,
  key: string,
  value: string | readonly string[] | undefined,
): void => {
  if (value == null) {
    return;
  }
  const ids = (Array.isArray(value) ? value : [value])
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
  if (ids.length === 0) {
    return;
  }
  search.set(key, ids.join(','));
};

const toSearch = (params: ListAdminInventoryParams): string => {
  const search = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
  });
  appendIdParam(search, 'companyId', params.companyId);
  appendIdParam(search, 'buildingId', params.buildingId);
  appendIdParam(search, 'floorId', params.floorId);
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
 * Lists buildings across companies for the admin buildings hub.
 */
export const listAdminBuildings = (
  params: ListAdminInventoryParams,
  options: AdminRequestOptions = {},
): Promise<AdminBuildingListResponse> =>
  apiFetch<AdminBuildingListResponse>(
    withCookie(
      {
        path: `/admin/buildings?${toSearch(params)}`,
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      },
      options.cookieHeader,
    ),
  );

/**
 * Lists floors across companies for the admin floors hub.
 */
export const listAdminFloors = (
  params: ListAdminInventoryParams,
  options: AdminRequestOptions = {},
): Promise<AdminFloorListResponse> =>
  apiFetch<AdminFloorListResponse>(
    withCookie(
      {
        path: `/admin/floors?${toSearch(params)}`,
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      },
      options.cookieHeader,
    ),
  );

/**
 * Lists apartments across companies for the admin apartments hub.
 */
export const listAdminApartments = (
  params: ListAdminInventoryParams,
  options: AdminRequestOptions = {},
): Promise<AdminApartmentListResponse> =>
  apiFetch<AdminApartmentListResponse>(
    withCookie(
      {
        path: `/admin/apartments?${toSearch(params)}`,
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      },
      options.cookieHeader,
    ),
  );

/**
 * Inventory-at-a-glance for one building (admin Buildings hub sheet).
 */
export const getAdminBuildingInventoryGlance = (
  buildingId: string,
  options: AdminRequestOptions = {},
): Promise<AdminBuildingInventoryGlance> =>
  apiFetch<AdminBuildingInventoryGlance>(
    withCookie(
      {
        path: `/admin/buildings/${encodeURIComponent(buildingId)}/inventory-glance`,
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      },
      options.cookieHeader,
    ),
  );

/**
 * Pins or unpins an apartment on the public homepage (max 6).
 */
export const setAdminApartmentFeaturedOnHome = (
  apartmentId: string,
  featuredOnHome: boolean,
): Promise<FeaturedOnHomeResponse> =>
  apiFetch<FeaturedOnHomeResponse>({
    path: `/admin/apartments/${encodeURIComponent(apartmentId)}/featured-on-home`,
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ featuredOnHome }),
  });
