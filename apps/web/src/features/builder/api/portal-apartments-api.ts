import type {
  BulkCreatePortalApartmentsRequest,
  CreatePortalApartmentRequest,
  PortalApartmentDetail,
  UpdatePortalApartmentRequest,
  UpdatePortalPublicationRequest,
} from "@toonexpo/contracts";

import { apiFetch } from "@/shared/api/client";

import {
  jsonCredentials,
  withPortalCookie,
  type PortalRequestOptions,
} from "./portal-request";

/**
 * Lists apartments on a floor.
 */
export const listPortalApartments = (
  floorId: string,
): Promise<PortalApartmentDetail[]> =>
  apiFetch<PortalApartmentDetail[]>({
    path: `/portal/floors/${encodeURIComponent(floorId)}/apartments`,
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

/**
 * Creates a single apartment on a floor.
 */
export const createPortalApartment = (
  floorId: string,
  body: CreatePortalApartmentRequest,
): Promise<PortalApartmentDetail> =>
  apiFetch<PortalApartmentDetail>({
    path: `/portal/floors/${encodeURIComponent(floorId)}/apartments`,
    method: "POST",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/**
 * Bulk-creates apartments on a floor.
 */
export const bulkCreatePortalApartments = (
  floorId: string,
  body: BulkCreatePortalApartmentsRequest,
): Promise<PortalApartmentDetail[]> =>
  apiFetch<PortalApartmentDetail[]>({
    path: `/portal/floors/${encodeURIComponent(floorId)}/apartments/bulk`,
    method: "POST",
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
        path: `/portal/apartments/${encodeURIComponent(id)}`,
        method: "GET",
        credentials: "include",
        cache: "no-store",
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
): Promise<PortalApartmentDetail> =>
  apiFetch<PortalApartmentDetail>({
    path: `/portal/apartments/${encodeURIComponent(id)}`,
    method: "PATCH",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/**
 * Changes apartment publication status (company_admin).
 */
export const updatePortalApartmentPublication = (
  id: string,
  body: UpdatePortalPublicationRequest,
): Promise<PortalApartmentDetail> =>
  apiFetch<PortalApartmentDetail>({
    path: `/portal/apartments/${encodeURIComponent(id)}/publication`,
    method: "PATCH",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/**
 * Deletes a draft apartment (company_admin).
 */
export const deletePortalApartment = (id: string): Promise<void> =>
  apiFetch<void>({
    path: `/portal/apartments/${encodeURIComponent(id)}`,
    method: "DELETE",
    credentials: "include",
  });
