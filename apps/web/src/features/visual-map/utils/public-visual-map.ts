import type { PublicVisualCanvasItem, PublicVisualHotspotItem } from "@toonexpo/contracts";

/**
 * Returns the primary published canvas when hotspots exist, otherwise null.
 */
export const pickPrimaryVisualCanvas = (
  canvases: PublicVisualCanvasItem[],
): PublicVisualCanvasItem | null => {
  if (canvases.length === 0) {
    return null;
  }

  const primary = canvases.find((canvas) => canvas.hotspots.length > 0);
  return primary ?? null;
};

export const buildProjectBuildingHref = (
  projectId: string,
  hotspot: PublicVisualHotspotItem,
): string => `/projects/${projectId}/buildings/${hotspot.target.id}`;

export const buildBuildingFloorHref = (
  projectId: string,
  buildingId: string,
  hotspot: PublicVisualHotspotItem,
): string =>
  `/projects/${projectId}/buildings/${buildingId}/floors/${hotspot.target.id}`;

export const buildFloorApartmentHref = (
  hotspot: PublicVisualHotspotItem,
): string => `/apartments/${hotspot.target.id}`;
