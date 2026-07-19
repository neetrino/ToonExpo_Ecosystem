import type { PublicVisualCanvasListResponse } from "@toonexpo/contracts";

import { apiFetch } from "@/shared/api/client";
import { ApiError, isApiErrorStatus } from "@/shared/api/errors";
import { visualMapFetch } from "@/shared/api/public-fetch";

const fetchVisualCanvases = async (
  path: string,
): Promise<PublicVisualCanvasListResponse | null> => {
  try {
    return await apiFetch<PublicVisualCanvasListResponse>({
      path,
      ...visualMapFetch(),
    });
  } catch (error) {
    if (isApiErrorStatus(error, 404)) {
      return null;
    }
    throw error;
  }
};

export const listProjectVisualCanvases = (
  projectId: string,
): Promise<PublicVisualCanvasListResponse | null> =>
  fetchVisualCanvases(
    `/projects/${encodeURIComponent(projectId)}/visual-canvases`,
  );

export const listBuildingVisualCanvases = (
  buildingId: string,
): Promise<PublicVisualCanvasListResponse | null> =>
  fetchVisualCanvases(
    `/buildings/${encodeURIComponent(buildingId)}/visual-canvases`,
  );

export const listFloorVisualCanvases = (
  floorId: string,
): Promise<PublicVisualCanvasListResponse | null> =>
  fetchVisualCanvases(
    `/floors/${encodeURIComponent(floorId)}/visual-canvases`,
  );

export { ApiError };
