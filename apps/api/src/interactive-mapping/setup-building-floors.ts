import type { SetupBuildingFloorsResponse } from '@toonexpo/contracts';
import { PublicationStatus, VisualMapContextType } from '@toonexpo/db';

import { entityNotFound } from '../portal/utils/access.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import {
  clearPrimaryForContext,
  requireCompanyMediaAsset,
} from '../visual-map/utils/context-validation.js';
import type { SetupBuildingFloorsDto } from './interactive-mapping.dto.js';
import { mapFloor } from './interactive-mapping.mappers.js';

/**
 * Ensures Floor rows 1..N, updates floorsCount, and optionally upserts
 * the primary building-context render canvas.
 */
export const setupBuildingFloors = async (
  prisma: PrismaService,
  buildingId: string,
  userId: string,
  dto: SetupBuildingFloorsDto,
): Promise<SetupBuildingFloorsResponse> => {
  const building = await prisma.db.building.findUnique({
    where: { id: buildingId },
    select: {
      id: true,
      projectId: true,
      project: { select: { builderCompanyId: true } },
      floors: { select: { number: true } },
    },
  });
  if (!building) {
    throw entityNotFound('Building');
  }

  const companyId = building.project.builderCompanyId;
  const existingNumbers = new Set(building.floors.map((f) => f.number));
  const missing = Array.from({ length: dto.floorCount }, (_, i) => i + 1).filter(
    (n) => !existingNumbers.has(n),
  );

  await prisma.db.$transaction(async (tx) => {
    if (missing.length > 0) {
      await tx.floor.createMany({
        data: missing.map((number) => ({
          buildingId,
          number,
          displayOrder: number,
          publicationStatus: PublicationStatus.draft,
          createdByUserId: userId,
          updatedByUserId: userId,
        })),
      });
    }
    await tx.building.update({
      where: { id: buildingId },
      data: { floorsCount: dto.floorCount, updatedByUserId: userId },
    });
  });

  const renderCanvasId = await resolveRenderCanvas(prisma, {
    buildingId,
    projectId: building.projectId,
    companyId,
    userId,
    ...(dto.renderMediaAssetId !== undefined ? { renderMediaAssetId: dto.renderMediaAssetId } : {}),
  });

  const floors = await prisma.db.floor.findMany({
    where: { buildingId, number: { lte: dto.floorCount } },
    orderBy: [{ number: 'asc' }],
  });

  return {
    buildingId,
    floorsCount: dto.floorCount,
    floors: floors.map(mapFloor),
    renderCanvasId,
  };
};

const resolveRenderCanvas = async (
  prisma: PrismaService,
  input: {
    buildingId: string;
    projectId: string;
    companyId: string;
    userId: string;
    renderMediaAssetId?: string;
  },
): Promise<string | null> => {
  if (input.renderMediaAssetId) {
    await requireCompanyMediaAsset(prisma, input.renderMediaAssetId, input.companyId);
    return upsertBuildingRenderCanvas(prisma, {
      ...input,
      mediaAssetId: input.renderMediaAssetId,
    });
  }
  const existing = await prisma.db.visualMapCanvas.findFirst({
    where: {
      projectId: input.projectId,
      contextType: VisualMapContextType.building,
      contextId: input.buildingId,
      isPrimary: true,
    },
    select: { id: true },
  });
  return existing?.id ?? null;
};

const upsertBuildingRenderCanvas = async (
  prisma: PrismaService,
  input: {
    buildingId: string;
    projectId: string;
    companyId: string;
    userId: string;
    mediaAssetId: string;
  },
): Promise<string> => {
  const existing = await prisma.db.visualMapCanvas.findFirst({
    where: {
      projectId: input.projectId,
      contextType: VisualMapContextType.building,
      contextId: input.buildingId,
      isPrimary: true,
    },
    select: { id: true },
  });

  if (existing) {
    const updated = await prisma.db.visualMapCanvas.update({
      where: { id: existing.id },
      data: { mediaAssetId: input.mediaAssetId, updatedByUserId: input.userId },
      select: { id: true },
    });
    return updated.id;
  }

  await clearPrimaryForContext(prisma, {
    projectId: input.projectId,
    contextType: 'building',
    contextId: input.buildingId,
  });

  const created = await prisma.db.visualMapCanvas.create({
    data: {
      ownerCompanyId: input.companyId,
      projectId: input.projectId,
      contextType: VisualMapContextType.building,
      contextId: input.buildingId,
      mediaAssetId: input.mediaAssetId,
      publicationStatus: PublicationStatus.draft,
      isPrimary: true,
      createdByUserId: input.userId,
      updatedByUserId: input.userId,
    },
    select: { id: true },
  });
  return created.id;
};
