import type {
  PortalVisualCanvasDetail,
  PortalVisualCanvasListItem,
  PortalVisualHotspotItem,
  PublicVisualCanvasItem,
  PublicVisualHotspotItem,
  VisualHotspotTargetType,
} from "@toonexpo/contracts";
import type { Prisma } from "@toonexpo/db";

import { toPortalMediaSummary } from "../../media/media.mapper.js";
import {
  formatFloorDisplayName,
  resolveTargetStatus,
} from "../utils/target-status.js";
import type { LoadedTargetEntities } from "../utils/target-validation.js";

type CanvasWithCounts = Prisma.VisualMapCanvasGetPayload<{
  include: { _count: { select: { hotspots: true } } };
}>;

type CanvasWithHotspots = Prisma.VisualMapCanvasGetPayload<{
  include: { hotspots: true; mediaAsset: true };
}>;

type HotspotRow = CanvasWithHotspots["hotspots"][number];

const decimalToString = (value: { toString(): string }): string =>
  value.toString();

export const mapPortalCanvasListItem = (
  canvas: CanvasWithCounts,
): PortalVisualCanvasListItem => ({
  id: canvas.id,
  projectId: canvas.projectId,
  contextType: canvas.contextType,
  contextId: canvas.contextId,
  mediaAssetId: canvas.mediaAssetId,
  title: canvas.title,
  description: canvas.description,
  publicationStatus: canvas.publicationStatus,
  isPrimary: canvas.isPrimary,
  sortOrder: canvas.sortOrder,
  hotspotCount: canvas._count.hotspots,
  createdAt: canvas.createdAt.toISOString(),
  updatedAt: canvas.updatedAt.toISOString(),
});

export const mapPortalHotspot = (
  hotspot: HotspotRow,
  entities: LoadedTargetEntities,
): PortalVisualHotspotItem => {
  const targetType = hotspot.targetType as VisualHotspotTargetType;
  const entity = lookupEditorEntity(entities, targetType, hotspot.targetId);

  return {
    id: hotspot.id,
    canvasId: hotspot.canvasId,
    targetType,
    targetId: hotspot.targetId,
    label: hotspot.label,
    xPercent: decimalToString(hotspot.xPercent),
    yPercent: decimalToString(hotspot.yPercent),
    markerStyle: hotspot.markerStyle,
    publicationStatus: hotspot.publicationStatus,
    sortOrder: hotspot.sortOrder,
    targetStatus: resolveTargetStatus(entity),
    createdAt: hotspot.createdAt.toISOString(),
    updatedAt: hotspot.updatedAt.toISOString(),
  };
};

export const mapPortalCanvasDetail = (
  canvas: CanvasWithHotspots,
  entities: LoadedTargetEntities,
): PortalVisualCanvasDetail => ({
  id: canvas.id,
  ownerCompanyId: canvas.ownerCompanyId,
  projectId: canvas.projectId,
  contextType: canvas.contextType,
  contextId: canvas.contextId,
  mediaAssetId: canvas.mediaAssetId,
  media: toPortalMediaSummary(canvas.mediaAsset),
  title: canvas.title,
  description: canvas.description,
  publicationStatus: canvas.publicationStatus,
  isPrimary: canvas.isPrimary,
  sortOrder: canvas.sortOrder,
  hotspots: canvas.hotspots.map((hotspot) => mapPortalHotspot(hotspot, entities)),
  createdAt: canvas.createdAt.toISOString(),
  updatedAt: canvas.updatedAt.toISOString(),
});

export const mapPublicCanvas = (
  canvas: CanvasWithHotspots,
  entities: LoadedTargetEntities,
): PublicVisualCanvasItem => ({
  id: canvas.id,
  contextType: canvas.contextType,
  contextId: canvas.contextId,
  title: canvas.title,
  description: canvas.description,
  media: {
    id: canvas.mediaAsset.id,
    fileUrl: canvas.mediaAsset.fileUrl,
    thumbnailUrl: canvas.mediaAsset.thumbnailUrl,
    altText: canvas.mediaAsset.altText,
    title: canvas.mediaAsset.title,
  },
  hotspots: canvas.hotspots
    .map((hotspot) => mapPublicHotspot(hotspot, entities))
    .filter((hotspot): hotspot is PublicVisualHotspotItem => hotspot != null),
});

const mapPublicHotspot = (
  hotspot: HotspotRow,
  entities: LoadedTargetEntities,
): PublicVisualHotspotItem | null => {
  const targetType = hotspot.targetType as VisualHotspotTargetType;
  const displayName = resolvePublicDisplayName(targetType, entities, hotspot.targetId);
  if (displayName == null) {
    return null;
  }

  return {
    id: hotspot.id,
    label: hotspot.label,
    xPercent: decimalToString(hotspot.xPercent),
    yPercent: decimalToString(hotspot.yPercent),
    markerStyle: hotspot.markerStyle,
    sortOrder: hotspot.sortOrder,
    target: {
      type: targetType,
      id: hotspot.targetId,
      displayName,
    },
  };
};

const resolvePublicDisplayName = (
  targetType: VisualHotspotTargetType,
  entities: LoadedTargetEntities,
  targetId: string,
): string | null => {
  if (targetType === "building") {
    const building = entities.buildings.get(targetId);
    if (resolveTargetStatus(building) !== "ok" || !building) {
      return null;
    }
    return building.name;
  }

  if (targetType === "floor") {
    const floor = entities.floors.get(targetId);
    if (resolveTargetStatus(floor) !== "ok" || !floor) {
      return null;
    }
    return formatFloorDisplayName(floor);
  }

  const apartment = entities.apartments.get(targetId);
  if (resolveTargetStatus(apartment) !== "ok" || !apartment) {
    return null;
  }
  return apartment.number;
};

const lookupEditorEntity = (
  entities: LoadedTargetEntities,
  targetType: VisualHotspotTargetType,
  targetId: string,
) => {
  if (targetType === "building") {
    return entities.buildings.get(targetId);
  }
  if (targetType === "floor") {
    return entities.floors.get(targetId);
  }
  return entities.apartments.get(targetId);
};
