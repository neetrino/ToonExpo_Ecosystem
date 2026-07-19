import type {
  CreatePortalVisualCanvasRequest,
  CreatePortalVisualHotspotRequest,
  PortalVisualCanvasDetail,
  PortalVisualCanvasListResponse,
  PortalVisualHotspotItem,
  UpdatePortalVisualCanvasRequest,
  UpdatePortalVisualHotspotRequest,
} from '@toonexpo/contracts';

import {
  catalogPath,
  jsonCredentials,
  withPortalCookie,
  type PortalRequestOptions,
} from '@/features/builder/api/portal-request';
import { apiFetch } from '@/shared/api/client';

export const listPortalProjectVisualCanvases = (
  projectId: string,
  options: PortalRequestOptions = {},
): Promise<PortalVisualCanvasListResponse> =>
  apiFetch<PortalVisualCanvasListResponse>(
    withPortalCookie(
      {
        path: catalogPath(
          `/portal/projects/${encodeURIComponent(projectId)}/visual-canvases`,
          options,
        ),
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      },
      options.cookieHeader,
    ),
  );

export const createPortalVisualCanvas = (
  projectId: string,
  body: CreatePortalVisualCanvasRequest,
  options: PortalRequestOptions = {},
): Promise<PortalVisualCanvasDetail> =>
  apiFetch<PortalVisualCanvasDetail>({
    path: catalogPath(`/portal/projects/${encodeURIComponent(projectId)}/visual-canvases`, options),
    method: 'POST',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const getPortalVisualCanvas = (
  canvasId: string,
  options: PortalRequestOptions = {},
): Promise<PortalVisualCanvasDetail> =>
  apiFetch<PortalVisualCanvasDetail>(
    withPortalCookie(
      {
        path: catalogPath(`/portal/visual-canvases/${encodeURIComponent(canvasId)}`, options),
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      },
      options.cookieHeader,
    ),
  );

export const updatePortalVisualCanvas = (
  canvasId: string,
  body: UpdatePortalVisualCanvasRequest,
  options: PortalRequestOptions = {},
): Promise<PortalVisualCanvasDetail> =>
  apiFetch<PortalVisualCanvasDetail>({
    path: catalogPath(`/portal/visual-canvases/${encodeURIComponent(canvasId)}`, options),
    method: 'PATCH',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const deletePortalVisualCanvas = (
  canvasId: string,
  options: PortalRequestOptions = {},
): Promise<void> =>
  apiFetch<void>({
    path: catalogPath(`/portal/visual-canvases/${encodeURIComponent(canvasId)}`, options),
    method: 'DELETE',
    credentials: 'include',
  });

export const createPortalVisualHotspot = (
  canvasId: string,
  body: CreatePortalVisualHotspotRequest,
  options: PortalRequestOptions = {},
): Promise<PortalVisualHotspotItem> =>
  apiFetch<PortalVisualHotspotItem>({
    path: catalogPath(`/portal/visual-canvases/${encodeURIComponent(canvasId)}/hotspots`, options),
    method: 'POST',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const updatePortalVisualHotspot = (
  canvasId: string,
  hotspotId: string,
  body: UpdatePortalVisualHotspotRequest,
  options: PortalRequestOptions = {},
): Promise<PortalVisualHotspotItem> =>
  apiFetch<PortalVisualHotspotItem>({
    path: catalogPath(
      `/portal/visual-canvases/${encodeURIComponent(canvasId)}/hotspots/${encodeURIComponent(hotspotId)}`,
      options,
    ),
    method: 'PATCH',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const deletePortalVisualHotspot = (
  canvasId: string,
  hotspotId: string,
  options: PortalRequestOptions = {},
): Promise<void> =>
  apiFetch<void>({
    path: catalogPath(
      `/portal/visual-canvases/${encodeURIComponent(canvasId)}/hotspots/${encodeURIComponent(hotspotId)}`,
      options,
    ),
    method: 'DELETE',
    credentials: 'include',
  });
