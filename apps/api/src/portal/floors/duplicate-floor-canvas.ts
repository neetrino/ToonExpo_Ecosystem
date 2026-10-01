import type { Prisma } from '@toonexpo/db';
import { VisualHotspotTargetType } from '@toonexpo/db';

import type { DuplicateFloorCanvas } from './duplicate-floor.types.js';

type HotspotTarget = {
  targetType: VisualHotspotTargetType;
  targetId: string;
};

/**
 * Points apartment hotspots at the copied units and floor hotspots at the new floor.
 * Returns null when the apartment was not copied.
 */
export const remapCopiedHotspotTarget = (
  hotspot: HotspotTarget,
  sourceFloorId: string,
  newFloorId: string,
  apartmentIds: ReadonlyMap<string, string>,
): string | null => {
  if (hotspot.targetType === VisualHotspotTargetType.apartment) {
    return apartmentIds.get(hotspot.targetId) ?? null;
  }
  if (hotspot.targetType === VisualHotspotTargetType.floor && hotspot.targetId === sourceFloorId) {
    return newFloorId;
  }
  return hotspot.targetId;
};

const copiedHotspotRows = (
  canvas: DuplicateFloorCanvas,
  canvasId: string,
  sourceFloorId: string,
  newFloorId: string,
  apartmentIds: ReadonlyMap<string, string>,
  userId: string,
): Prisma.VisualHotspotCreateManyInput[] =>
  canvas.hotspots.flatMap((hotspot) => {
    const targetId = remapCopiedHotspotTarget(hotspot, sourceFloorId, newFloorId, apartmentIds);
    if (targetId == null) {
      return [];
    }
    const points = hotspot.points == null ? undefined : (hotspot.points as Prisma.InputJsonValue);
    return [
      {
        canvasId,
        targetType: hotspot.targetType,
        targetId,
        label: hotspot.label,
        xPercent: hotspot.xPercent,
        yPercent: hotspot.yPercent,
        shapeType: hotspot.shapeType,
        interactionType: hotspot.interactionType,
        svgPath: hotspot.svgPath,
        markerStyle: hotspot.markerStyle,
        publicationStatus: hotspot.publicationStatus,
        sortOrder: hotspot.sortOrder,
        createdByUserId: userId,
        updatedByUserId: userId,
        ...(points !== undefined ? { points } : {}),
      },
    ];
  });

const copyOneCanvas = async (
  tx: Prisma.TransactionClient,
  canvas: DuplicateFloorCanvas,
  sourceFloorId: string,
  newFloorId: string,
  apartmentIds: ReadonlyMap<string, string>,
  userId: string,
): Promise<void> => {
  const created = await tx.visualMapCanvas.create({
    data: {
      ownerCompanyId: canvas.ownerCompanyId,
      projectId: canvas.projectId,
      contextType: canvas.contextType,
      contextId: newFloorId,
      mediaAssetId: canvas.mediaAssetId,
      title: canvas.title,
      description: canvas.description,
      publicationStatus: canvas.publicationStatus,
      isPrimary: canvas.isPrimary,
      sortOrder: canvas.sortOrder,
      createdByUserId: userId,
      updatedByUserId: userId,
    },
    select: { id: true },
  });
  const hotspots = copiedHotspotRows(
    canvas,
    created.id,
    sourceFloorId,
    newFloorId,
    apartmentIds,
    userId,
  );
  if (hotspots.length === 0) {
    return;
  }
  await tx.visualHotspot.createMany({ data: hotspots });
};

/**
 * Copies floor-plan canvases and remaps hotspots onto the new floor and apartments.
 */
export const copyFloorCanvases = async (
  tx: Prisma.TransactionClient,
  canvases: readonly DuplicateFloorCanvas[],
  sourceFloorId: string,
  newFloorId: string,
  apartmentIds: ReadonlyMap<string, string>,
  userId: string,
): Promise<void> => {
  for (const canvas of canvases) {
    await copyOneCanvas(tx, canvas, sourceFloorId, newFloorId, apartmentIds, userId);
  }
};
