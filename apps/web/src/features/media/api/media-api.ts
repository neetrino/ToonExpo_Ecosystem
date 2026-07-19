import type { MediaAssetItem, MediaListResponse } from '@toonexpo/contracts';

import { apiFetch, buildApiUrl } from '@/shared/api/client';
import { ApiError } from '@/shared/api/errors';
import { withCsrfHeaders } from '@/shared/api/csrf';

export type MediaUploadContext = 'portal' | 'admin' | { companyId: string };

const listPath = (context: MediaUploadContext): string => {
  if (typeof context === 'object') {
    return `/admin/companies/${encodeURIComponent(context.companyId)}/catalog/media`;
  }
  return context === 'portal' ? '/portal/media' : '/admin/media';
};

export const listMediaAssets = (
  context: MediaUploadContext,
  page = 1,
  pageSize = 24,
): Promise<MediaListResponse> =>
  apiFetch<MediaListResponse>({
    path: `${listPath(context)}?page=${page}&pageSize=${pageSize}`,
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

export const uploadMediaAsset = async (
  context: MediaUploadContext,
  file: File,
): Promise<MediaAssetItem> => {
  const formData = new FormData();
  formData.append('file', file);

  const headers = await withCsrfHeaders(undefined);
  const response = await fetch(buildApiUrl(listPath(context)), {
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
