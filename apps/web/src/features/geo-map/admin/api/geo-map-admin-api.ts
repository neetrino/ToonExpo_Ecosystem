import type {
  AdminGeoMapModelItem,
  AdminGeoMapModelListResponse,
  CreateGeoMapModelRequest,
  GeoMapGeocodeResponse,
  UpdateGeoMapModelRequest,
} from '@toonexpo/contracts';

import {
  GEO_MAP_ADMIN_API_PREFIX,
  GEO_MAP_ADMIN_GEOCODE_PATH,
} from '@/features/geo-map/admin/constants';
import { apiFetch } from '@/shared/api/client';

const jsonCredentials = {
  credentials: 'include' as const,
  headers: { 'Content-Type': 'application/json' },
};

/** Lists all project map models (draft + published) for the admin editor. */
export const listAdminGeoMapModels = (): Promise<AdminGeoMapModelListResponse> =>
  apiFetch<AdminGeoMapModelListResponse>({
    path: GEO_MAP_ADMIN_API_PREFIX,
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

/** Creates a placed map model for a project. */
export const createAdminGeoMapModel = (
  body: CreateGeoMapModelRequest,
): Promise<AdminGeoMapModelItem> =>
  apiFetch<AdminGeoMapModelItem>({
    path: GEO_MAP_ADMIN_API_PREFIX,
    method: 'POST',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/** Patches transform / media / publish flag for a map model. */
export const updateAdminGeoMapModel = (
  id: string,
  body: UpdateGeoMapModelRequest,
): Promise<AdminGeoMapModelItem> =>
  apiFetch<AdminGeoMapModelItem>({
    path: `${GEO_MAP_ADMIN_API_PREFIX}/${encodeURIComponent(id)}`,
    method: 'PATCH',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/** Look up an address for the admin map camera fly-to. */
export const geocodeAdminGeoMapAddress = (query: string): Promise<GeoMapGeocodeResponse> =>
  apiFetch<GeoMapGeocodeResponse>({
    path: `${GEO_MAP_ADMIN_GEOCODE_PATH}?q=${encodeURIComponent(query)}`,
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

/** Deletes a map model. */
export const deleteAdminGeoMapModel = (id: string): Promise<void> =>
  apiFetch<void>({
    path: `${GEO_MAP_ADMIN_API_PREFIX}/${encodeURIComponent(id)}`,
    method: 'DELETE',
    credentials: 'include',
  });
