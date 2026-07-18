import type { PublicVisualCanvasListResponse } from "@toonexpo/contracts";

import { apiFetch, type ApiFetchOptions } from "@/shared/api/client";
import { ApiError, isApiErrorStatus } from "@/shared/api/errors";

export type PublicVisualMapRequestOptions = {
  cookieHeader?: string | undefined;
};

const buildFetch = (
  path: string,
  cookieHeader?: string,
): ApiFetchOptions => {
  if (!cookieHeader) {
    return {
      path,
      method: "GET",
      cache: "no-store",
      credentials: "include",
    };
  }

  return {
    path,
    method: "GET",
    cache: "no-store",
    credentials: "include",
    headers: { Cookie: cookieHeader },
  };
};

const fetchVisualCanvases = async (
  path: string,
  options: PublicVisualMapRequestOptions = {},
): Promise<PublicVisualCanvasListResponse | null> => {
  try {
    return await apiFetch<PublicVisualCanvasListResponse>(
      buildFetch(path, options.cookieHeader),
    );
  } catch (error) {
    if (isApiErrorStatus(error, 404)) {
      return null;
    }
    throw error;
  }
};

export const listProjectVisualCanvases = (
  projectId: string,
  options: PublicVisualMapRequestOptions = {},
): Promise<PublicVisualCanvasListResponse | null> =>
  fetchVisualCanvases(
    `/projects/${encodeURIComponent(projectId)}/visual-canvases`,
    options,
  );

export const listBuildingVisualCanvases = (
  buildingId: string,
  options: PublicVisualMapRequestOptions = {},
): Promise<PublicVisualCanvasListResponse | null> =>
  fetchVisualCanvases(
    `/buildings/${encodeURIComponent(buildingId)}/visual-canvases`,
    options,
  );

export const listFloorVisualCanvases = (
  floorId: string,
  options: PublicVisualMapRequestOptions = {},
): Promise<PublicVisualCanvasListResponse | null> =>
  fetchVisualCanvases(
    `/floors/${encodeURIComponent(floorId)}/visual-canvases`,
    options,
  );

export { ApiError };
