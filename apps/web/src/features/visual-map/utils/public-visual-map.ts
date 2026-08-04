import type {
  FloorDetail,
  PublicVisualCanvasItem,
  PublicVisualHotspotItem,
} from '@toonexpo/contracts';

import { apiFetch } from '@/shared/api/client';
import { isApiErrorStatus } from '@/shared/api/errors';
import { catalogProjectFetch } from '@/shared/api/public-fetch';

/**
 * Returns the primary published canvas. Prefers canvases with hotspots when present.
 */
export const pickPrimaryVisualCanvas = (
  canvases: PublicVisualCanvasItem[],
): PublicVisualCanvasItem | null => {
  if (canvases.length === 0) {
    return null;
  }

  const withHotspots = canvases.find((canvas) => canvas.hotspots.length > 0);
  return withHotspots ?? canvases[0] ?? null;
};

export const buildApartmentHref = (apartmentId: string): string =>
  `/apartments/${encodeURIComponent(apartmentId)}`;

export const buildBuildingHref = (projectId: string, buildingId: string): string =>
  `/projects/${encodeURIComponent(projectId)}/buildings/${encodeURIComponent(buildingId)}`;

export const buildDistrictHref = (projectId: string, districtId: string): string =>
  `/projects/${encodeURIComponent(projectId)}/districts/${encodeURIComponent(districtId)}`;

export const buildFloorHref = (projectId: string, buildingId: string, floorId: string): string =>
  `/projects/${encodeURIComponent(projectId)}/buildings/${encodeURIComponent(buildingId)}/floors/${encodeURIComponent(floorId)}`;

/**
 * Sync public path for a hotspot when the destination can be derived without an extra fetch.
 * Floor targets outside a building canvas return null — use `resolveHotspotHref`.
 */
export const buildHotspotHref = (
  projectId: string,
  hotspot: PublicVisualHotspotItem,
  canvas: PublicVisualCanvasItem,
): string | null => {
  const { type, id } = hotspot.target;

  if (type === 'apartment') {
    return buildApartmentHref(id);
  }
  if (type === 'building') {
    return buildBuildingHref(projectId, id);
  }
  if (type === 'district') {
    return buildDistrictHref(projectId, id);
  }
  if (type === 'floor' && canvas.contextType === 'building') {
    return buildFloorHref(projectId, canvas.contextId, id);
  }

  return null;
};

const fetchFloorForNavigation = async (
  floorId: string,
  projectId: string,
): Promise<FloorDetail | null> => {
  try {
    return await apiFetch<FloorDetail>({
      path: `/floors/${encodeURIComponent(floorId)}`,
      ...catalogProjectFetch(projectId),
    });
  } catch (error) {
    if (isApiErrorStatus(error, 404)) {
      return null;
    }
    throw error;
  }
};

/**
 * Resolves a refresh-safe public path for a polygon/point hotspot click.
 */
export const resolveHotspotHref = async (
  projectId: string,
  hotspot: PublicVisualHotspotItem,
  canvas: PublicVisualCanvasItem,
): Promise<string | null> => {
  const direct = buildHotspotHref(projectId, hotspot, canvas);
  if (direct) {
    return direct;
  }

  if (hotspot.target.type !== 'floor') {
    return null;
  }

  const floor = await fetchFloorForNavigation(hotspot.target.id, projectId);
  if (!floor || floor.project.id !== projectId) {
    return null;
  }

  return buildFloorHref(projectId, floor.building.id, floor.id);
};
