import type {
  PublicVisualCanvasItem,
  PublicVisualHotspotItem,
  VisualHotspotTargetType,
} from '@toonexpo/contracts';

import {
  listBuildingVisualCanvases,
  listDistrictVisualCanvases,
  listFloorVisualCanvases,
} from '@/features/visual-map/api/public-visual-map-api';

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

const STAGE_TARGET_TYPES = new Set<VisualHotspotTargetType>(['district', 'building', 'floor']);

/**
 * Whether a hotspot target can open another map stage (vs final apartment page).
 */
export const isDrillDownTargetType = (targetType: VisualHotspotTargetType): boolean =>
  STAGE_TARGET_TYPES.has(targetType);

/**
 * Loads the published primary canvas for a hotspot map-stage target.
 * Returns null when the destination has no published interactive map.
 */
export const fetchCanvasForHotspotTarget = async (
  hotspot: PublicVisualHotspotItem,
): Promise<PublicVisualCanvasItem | null> => {
  const { type, id } = hotspot.target;

  if (type === 'district') {
    const response = await listDistrictVisualCanvases(id);
    return pickPrimaryVisualCanvas(response?.data ?? []);
  }

  if (type === 'building') {
    const response = await listBuildingVisualCanvases(id);
    return pickPrimaryVisualCanvas(response?.data ?? []);
  }

  if (type === 'floor') {
    const response = await listFloorVisualCanvases(id);
    return pickPrimaryVisualCanvas(response?.data ?? []);
  }

  return null;
};

export const buildApartmentHref = (apartmentId: string): string => `/apartments/${apartmentId}`;

export const buildBuildingFallbackHref = (projectId: string, buildingId: string): string =>
  `/projects/${projectId}/buildings/${buildingId}`;
