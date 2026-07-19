import type {
  BulkCreatePortalApartmentsRequest,
  CreatePortalApartmentRequest,
  PortalApartmentDetail,
  UpdatePortalApartmentRequest,
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
 * Lists apartments on a floor.
 */
export const listPortalApartments = (
  floorId: string,
  options: PortalRequestOptions = {},
): Promise<PortalApartmentDetail[]> =>
  apiFetch<PortalApartmentDetail[]>({
    path: catalogPath(`/portal/floors/${encodeURIComponent(floorId)}/apartments`, options),
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

/**
 * Creates a single apartment on a floor.
 */
export const createPortalApartment = (
  floorId: string,
  body: CreatePortalApartmentRequest,
  options: PortalRequestOptions = {},
): Promise<PortalApartmentDetail> =>
  apiFetch<PortalApartmentDetail>({
    path: catalogPath(`/portal/floors/${encodeURIComponent(floorId)}/apartments`, options),
    method: 'POST',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/**
 * Bulk-creates apartments on a floor.
 */
export const bulkCreatePortalApartments = (
  floorId: string,
  body: BulkCreatePortalApartmentsRequest,
  options: PortalRequestOptions = {},
): Promise<PortalApartmentDetail[]> =>
  apiFetch<PortalApartmentDetail[]>({
    path: catalogPath(`/portal/floors/${encodeURIComponent(floorId)}/apartments/bulk`, options),
    method: 'POST',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/**
 * Fetches an apartment by id.
 */
export const getPortalApartment = (
  id: string,
  options: PortalRequestOptions = {},
): Promise<PortalApartmentDetail> =>
  apiFetch<PortalApartmentDetail>(
    withPortalCookie(
      {
        path: catalogPath(`/portal/apartments/${encodeURIComponent(id)}`, options),
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      },
      options.cookieHeader,
    ),
  );

/**
 * Patches apartment fields, sales status, and translations.
 */
export const updatePortalApartment = (
  id: string,
  body: UpdatePortalApartmentRequest,
  options: PortalRequestOptions = {},
): Promise<PortalApartmentDetail> =>
  apiFetch<PortalApartmentDetail>({
    path: catalogPath(`/portal/apartments/${encodeURIComponent(id)}`, options),
    method: 'PATCH',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/**
 * Changes apartment publication status (company_admin).
 */
export const updatePortalApartmentPublication = (
  id: string,
  body: UpdatePortalPublicationRequest,
  options: PortalRequestOptions = {},
): Promise<PortalApartmentDetail> =>
  apiFetch<PortalApartmentDetail>({
    path: catalogPath(`/portal/apartments/${encodeURIComponent(id)}/publication`, options),
    method: 'PATCH',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/**
 * Deletes a draft apartment (company_admin).
 */
export const deletePortalApartment = (
  id: string,
  options: PortalRequestOptions = {},
): Promise<void> =>
  apiFetch<void>({
    path: catalogPath(`/portal/apartments/${encodeURIComponent(id)}`, options),
    method: 'DELETE',
    credentials: 'include',
  });
