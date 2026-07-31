import type {
  CityMapBuildingOptionsResponse,
  CityMapPlacementItem,
  CityMapPlacementListResponse,
  CreateCityMapPlacementRequest,
  MediaAssetItem,
  PublicCityMapConfig,
  PublicCityMapPlacementsResponse,
  UpdateCityMapPlacementRequest,
} from '@toonexpo/contracts';

import { apiFetch, buildApiUrl } from '@/shared/api/client';
import { withCsrfHeaders } from '@/shared/api/csrf';
import { ApiError } from '@/shared/api/errors';

export const listAdminCityMapPlacements = (query?: {
  status?: string;
  projectId?: string;
  q?: string;
}): Promise<CityMapPlacementListResponse> => {
  const params = new URLSearchParams();
  if (query?.status) params.set('status', query.status);
  if (query?.projectId) params.set('projectId', query.projectId);
  if (query?.q) params.set('q', query.q);
  const qs = params.toString();
  return apiFetch<CityMapPlacementListResponse>({
    path: `/admin/city-map/placements${qs ? `?${qs}` : ''}`,
    credentials: 'include',
  });
};

export const createAdminCityMapPlacement = (
  body: CreateCityMapPlacementRequest,
): Promise<CityMapPlacementItem> =>
  apiFetch<CityMapPlacementItem>({
    path: '/admin/city-map/placements',
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

export const updateAdminCityMapPlacement = (
  id: string,
  body: UpdateCityMapPlacementRequest,
): Promise<CityMapPlacementItem> =>
  apiFetch<CityMapPlacementItem>({
    path: `/admin/city-map/placements/${id}`,
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

export const deleteAdminCityMapPlacement = (id: string): Promise<void> =>
  apiFetch<void>({
    path: `/admin/city-map/placements/${id}`,
    method: 'DELETE',
    credentials: 'include',
  });

export const publishAdminCityMapPlacement = (id: string): Promise<CityMapPlacementItem> =>
  apiFetch<CityMapPlacementItem>({
    path: `/admin/city-map/placements/${id}/publish`,
    method: 'POST',
    credentials: 'include',
  });

export const unpublishAdminCityMapPlacement = (id: string): Promise<CityMapPlacementItem> =>
  apiFetch<CityMapPlacementItem>({
    path: `/admin/city-map/placements/${id}/unpublish`,
    method: 'POST',
    credentials: 'include',
  });

export const searchCityMapBuildingOptions = (
  q?: string,
): Promise<CityMapBuildingOptionsResponse> => {
  const params = new URLSearchParams();
  if (q?.trim()) params.set('q', q.trim());
  const qs = params.toString();
  return apiFetch<CityMapBuildingOptionsResponse>({
    path: `/admin/city-map/building-options${qs ? `?${qs}` : ''}`,
    credentials: 'include',
  });
};

export const uploadCityMapGlb = async (file: File): Promise<MediaAssetItem> => {
  const formData = new FormData();
  formData.append('file', file);
  const headers = await withCsrfHeaders(undefined);
  const response = await fetch(buildApiUrl('/admin/media/models'), {
    method: 'POST',
    body: formData,
    credentials: 'include',
    headers,
  });
  if (!response.ok) {
    throw new ApiError(response.status, response.statusText);
  }
  return (await response.json()) as MediaAssetItem;
};

export const listPublicCityMapPlacements = (): Promise<PublicCityMapPlacementsResponse> =>
  apiFetch<PublicCityMapPlacementsResponse>({
    path: '/public/city-map/placements',
  });

export const getPublicCityMapConfig = (): Promise<PublicCityMapConfig> =>
  apiFetch<PublicCityMapConfig>({ path: '/public/city-map/config' });
