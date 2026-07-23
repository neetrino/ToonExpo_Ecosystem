import type {
  AdminApartmentListResponse,
  AdminBuildingListResponse,
  AdminFloorListResponse,
} from '@toonexpo/contracts';

import {
  type AdminRequestOptions,
  type ListAdminProjectsParams,
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

const toSearch = (params: ListAdminProjectsParams): string => {
  const search = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
  });
  if (params.companyId) {
    search.set('companyId', params.companyId);
  }
  return search.toString();
};

/**
 * Lists buildings across companies for the admin buildings hub.
 */
export const listAdminBuildings = (
  params: ListAdminProjectsParams,
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
  params: ListAdminProjectsParams,
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
  params: ListAdminProjectsParams,
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
