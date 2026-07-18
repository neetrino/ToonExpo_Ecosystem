import type {
  CreatePortalVisualCanvasRequest,
  CreatePortalVisualHotspotRequest,
  PortalVisualCanvasDetail,
  PortalVisualCanvasListResponse,
  PortalVisualHotspotItem,
  UpdatePortalVisualCanvasRequest,
  UpdatePortalVisualHotspotRequest,
} from "@toonexpo/contracts";

import {
  jsonCredentials,
  withPortalCookie,
  type PortalRequestOptions,
} from "@/features/builder/api/portal-request";
import { apiFetch } from "@/shared/api/client";

export const listPortalProjectVisualCanvases = (
  projectId: string,
  options: PortalRequestOptions = {},
): Promise<PortalVisualCanvasListResponse> =>
  apiFetch<PortalVisualCanvasListResponse>(
    withPortalCookie(
      {
        path: `/portal/projects/${encodeURIComponent(projectId)}/visual-canvases`,
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
      options.cookieHeader,
    ),
  );

export const createPortalVisualCanvas = (
  projectId: string,
  body: CreatePortalVisualCanvasRequest,
): Promise<PortalVisualCanvasDetail> =>
  apiFetch<PortalVisualCanvasDetail>({
    path: `/portal/projects/${encodeURIComponent(projectId)}/visual-canvases`,
    method: "POST",
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
        path: `/portal/visual-canvases/${encodeURIComponent(canvasId)}`,
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
      options.cookieHeader,
    ),
  );

export const updatePortalVisualCanvas = (
  canvasId: string,
  body: UpdatePortalVisualCanvasRequest,
): Promise<PortalVisualCanvasDetail> =>
  apiFetch<PortalVisualCanvasDetail>({
    path: `/portal/visual-canvases/${encodeURIComponent(canvasId)}`,
    method: "PATCH",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const deletePortalVisualCanvas = (canvasId: string): Promise<void> =>
  apiFetch<void>({
    path: `/portal/visual-canvases/${encodeURIComponent(canvasId)}`,
    method: "DELETE",
    credentials: "include",
  });

export const createPortalVisualHotspot = (
  canvasId: string,
  body: CreatePortalVisualHotspotRequest,
): Promise<PortalVisualHotspotItem> =>
  apiFetch<PortalVisualHotspotItem>({
    path: `/portal/visual-canvases/${encodeURIComponent(canvasId)}/hotspots`,
    method: "POST",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const updatePortalVisualHotspot = (
  canvasId: string,
  hotspotId: string,
  body: UpdatePortalVisualHotspotRequest,
): Promise<PortalVisualHotspotItem> =>
  apiFetch<PortalVisualHotspotItem>({
    path: `/portal/visual-canvases/${encodeURIComponent(canvasId)}/hotspots/${encodeURIComponent(hotspotId)}`,
    method: "PATCH",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const deletePortalVisualHotspot = (
  canvasId: string,
  hotspotId: string,
): Promise<void> =>
  apiFetch<void>({
    path: `/portal/visual-canvases/${encodeURIComponent(canvasId)}/hotspots/${encodeURIComponent(hotspotId)}`,
    method: "DELETE",
    credentials: "include",
  });
