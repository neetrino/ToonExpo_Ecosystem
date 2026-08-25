import { VisualMapContextType as DbContextType, PublicationStatus } from '@toonexpo/db';

import type { PrismaService } from '../../prisma/prisma.service.js';
import { clearPrimaryForContext, requireCompanyMediaAsset } from './context-validation.js';

type FloorCanvasRow = {
  id: string;
  mediaAssetId: string;
  isPrimary: boolean;
  publicationStatus: PublicationStatus;
};

type SyncFloorPlanToCanvasInput = {
  companyId: string;
  userId: string;
  projectId: string;
  floorId: string;
  mediaAssetId: string | null;
  title?: string | null;
};

type SyncFloorCanvasToPlanInput = {
  floorId: string;
  mediaAssetId: string | null;
};

const findFloorCanvas = async (
  prisma: PrismaService,
  projectId: string,
  floorId: string,
): Promise<FloorCanvasRow | null> => {
  const primary = await prisma.db.visualMapCanvas.findFirst({
    where: {
      projectId,
      contextType: DbContextType.floor,
      contextId: floorId,
      isPrimary: true,
    },
    select: {
      id: true,
      mediaAssetId: true,
      isPrimary: true,
      publicationStatus: true,
    },
  });
  if (primary) {
    return primary;
  }
  return prisma.db.visualMapCanvas.findFirst({
    where: {
      projectId,
      contextType: DbContextType.floor,
      contextId: floorId,
    },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    select: {
      id: true,
      mediaAssetId: true,
      isPrimary: true,
      publicationStatus: true,
    },
  });
};

const deleteFloorCanvas = async (
  prisma: PrismaService,
  canvas: FloorCanvasRow,
): Promise<void> => {
  if (canvas.publicationStatus === PublicationStatus.published) {
    await prisma.db.visualMapCanvas.update({
      where: { id: canvas.id },
      data: { publicationStatus: PublicationStatus.draft },
    });
  }
  await prisma.db.visualMapCanvas.delete({ where: { id: canvas.id } });
};

/**
 * Keeps the primary floor VisualMapCanvas media in sync with Floor.floorplanMediaId.
 * Null clears/deletes the floor canvas (hotspots included).
 */
export const syncFloorPlanMediaToCanvas = async (
  prisma: PrismaService,
  input: SyncFloorPlanToCanvasInput,
): Promise<void> => {
  const existing = await findFloorCanvas(prisma, input.projectId, input.floorId);

  if (input.mediaAssetId == null) {
    if (existing) {
      await deleteFloorCanvas(prisma, existing);
    }
    return;
  }

  await requireCompanyMediaAsset(prisma, input.mediaAssetId, input.companyId);

  if (existing) {
    const needsMediaUpdate = existing.mediaAssetId !== input.mediaAssetId;
    const needsPrimary = !existing.isPrimary;
    if (!needsMediaUpdate && !needsPrimary) {
      return;
    }
    if (needsPrimary) {
      await clearPrimaryForContext(prisma, {
        projectId: input.projectId,
        contextType: 'floor',
        contextId: input.floorId,
        excludeCanvasId: existing.id,
      });
    }
    await prisma.db.visualMapCanvas.update({
      where: { id: existing.id },
      data: {
        ...(needsMediaUpdate ? { mediaAssetId: input.mediaAssetId } : {}),
        ...(needsPrimary ? { isPrimary: true } : {}),
        updatedByUserId: input.userId,
      },
    });
    return;
  }

  await clearPrimaryForContext(prisma, {
    projectId: input.projectId,
    contextType: 'floor',
    contextId: input.floorId,
  });

  const raced = await findFloorCanvas(prisma, input.projectId, input.floorId);
  if (raced) {
    await prisma.db.visualMapCanvas.update({
      where: { id: raced.id },
      data: {
        mediaAssetId: input.mediaAssetId,
        isPrimary: true,
        updatedByUserId: input.userId,
      },
    });
    return;
  }

  await prisma.db.visualMapCanvas.create({
    data: {
      ownerCompanyId: input.companyId,
      projectId: input.projectId,
      contextType: DbContextType.floor,
      contextId: input.floorId,
      mediaAssetId: input.mediaAssetId,
      title: input.title ?? null,
      publicationStatus: PublicationStatus.published,
      isPrimary: true,
      sortOrder: 0,
      createdByUserId: input.userId,
      updatedByUserId: input.userId,
    },
  });
};

/**
 * Writes canvas background media onto Floor.floorplanMediaId (same MediaAsset id).
 */
export const syncFloorCanvasMediaToFloorPlan = async (
  prisma: PrismaService,
  input: SyncFloorCanvasToPlanInput,
): Promise<void> => {
  await prisma.db.floor.update({
    where: { id: input.floorId },
    data: { floorplanMediaId: input.mediaAssetId },
  });
};

/**
 * After a floor canvas is removed, point floorplanMediaId at remaining canvas media or null.
 */
export const refreshFloorPlanAfterCanvasChange = async (
  prisma: PrismaService,
  projectId: string,
  floorId: string,
): Promise<void> => {
  const remaining = await findFloorCanvas(prisma, projectId, floorId);
  await syncFloorCanvasMediaToFloorPlan(prisma, {
    floorId,
    mediaAssetId: remaining?.mediaAssetId ?? null,
  });
};
