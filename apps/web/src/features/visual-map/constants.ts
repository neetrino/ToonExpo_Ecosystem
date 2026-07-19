import type { VisualHotspotTargetType, VisualMapContextType } from "@toonexpo/contracts";

export const VISUAL_MAP_CONTEXT_TYPES: VisualMapContextType[] = [
  "project",
  "building",
  "floor",
];

export const VISUAL_HOTSPOT_TARGET_TYPES: VisualHotspotTargetType[] = [
  "building",
  "floor",
  "apartment",
];

export const VISUAL_MAP_PUBLICATION_STATUSES = [
  "draft",
  "published",
  "archived",
] as const;

export const portalProjectVisualCanvasesQueryKey = (projectId: string) =>
  ["portal", "projects", projectId, "visual-canvases"] as const;

export const portalVisualCanvasQueryKey = (canvasId: string) =>
  ["portal", "visual-canvases", canvasId] as const;

export const publicProjectVisualCanvasesQueryKey = (projectId: string) =>
  ["public", "projects", projectId, "visual-canvases"] as const;

export const publicBuildingVisualCanvasesQueryKey = (buildingId: string) =>
  ["public", "buildings", buildingId, "visual-canvases"] as const;

export const publicFloorVisualCanvasesQueryKey = (floorId: string) =>
  ["public", "floors", floorId, "visual-canvases"] as const;

/** SVG marker radius in viewBox units (0–100). */
export const VISUAL_MAP_MARKER_HIT_RADIUS = 4;

/** Visible marker radius in viewBox units. */
export const VISUAL_MAP_MARKER_VISIBLE_RADIUS = 2;
