import type { MediaAssetItem, MediaListResponse } from '@toonexpo/contracts';

import { apiFetch, buildApiUrl } from '@/shared/api/client';
import { ApiError } from '@/shared/api/errors';
import { withCsrfHeaders } from '@/shared/api/csrf';

export type MediaUploadContext = 'portal' | 'admin' | { companyId: string };

/** Matches NestJS `MEDIA_UPLOAD_KINDS` (`image` default, `model3d` for GLB). */
export type MediaUploadKind = 'image' | 'model3d';

export type UploadMediaAssetOptions = {
  kind?: MediaUploadKind;
};

const listPath = (context: MediaUploadContext): string => {
  if (typeof context === 'object') {
    return `/admin/companies/${encodeURIComponent(context.companyId)}/catalog/media`;
  }
  return context === 'portal' ? '/portal/media' : '/admin/media';
};

const uploadPath = (context: MediaUploadContext, kind?: MediaUploadKind): string => {
  const base = listPath(context);
  if (!kind || kind === 'image') {
    return base;
  }
  return `${base}?kind=${encodeURIComponent(kind)}`;
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

export const getMediaAsset = (
  context: MediaUploadContext,
  mediaId: string,
): Promise<MediaAssetItem> =>
  apiFetch<MediaAssetItem>({
    path: `${listPath(context)}/${encodeURIComponent(mediaId)}`,
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

const MEDIA_LOOKUP_PAGE_SIZE = 100;
const MEDIA_LOOKUP_MAX_PAGES = 20;

const findMediaAssetInList = async (
  context: MediaUploadContext,
  mediaId: string,
): Promise<MediaAssetItem> => {
  let page = 1;
  let totalPages = 1;
  while (page <= totalPages && page <= MEDIA_LOOKUP_MAX_PAGES) {
    const response = await listMediaAssets(context, page, MEDIA_LOOKUP_PAGE_SIZE);
    totalPages = response.meta.totalPages;
    const match = response.data.find((item) => item.id === mediaId);
    if (match) {
      return match;
    }
    page += 1;
  }
  throw new ApiError(404, 'Not Found', 'Media asset not found');
};

/**
 * Loads one media asset by id. Falls back to the existing list endpoint
 * when GET-by-id is unavailable.
 */
export const resolveMediaAsset = async (
  context: MediaUploadContext,
  mediaId: string,
): Promise<MediaAssetItem> => {
  try {
    return await getMediaAsset(context, mediaId);
  } catch {
    return findMediaAssetInList(context, mediaId);
  }
};

export const uploadMediaAsset = async (
  context: MediaUploadContext,
  file: File,
  options: UploadMediaAssetOptions = {},
): Promise<MediaAssetItem> => {
  const formData = new FormData();
  formData.append('file', file);

  const headers = await withCsrfHeaders(undefined);
  const response = await fetch(buildApiUrl(uploadPath(context, options.kind)), {
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
