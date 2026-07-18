import { BadRequestException } from "@nestjs/common";
import type { VisualMapContextType } from "@toonexpo/contracts";
import { VisualMapContextType as DbContextType } from "@toonexpo/db";

import type { PrismaService } from "../../prisma/prisma.service.js";
import { entityNotFound } from "../../portal/utils/access.js";
import { assertProjectContextId } from "./target-status.js";

type ContextValidationInput = {
  contextType: VisualMapContextType;
  contextId: string;
  projectId: string;
  companyId: string;
};

/**
 * Validates the canvas context entity exists within the project and company.
 */
export const validateCanvasContext = async (
  prisma: PrismaService,
  input: ContextValidationInput,
): Promise<void> => {
  const { contextType, contextId, projectId, companyId } = input;

  if (contextType === "project") {
    assertProjectContextId(projectId, contextId);
    return;
  }

  if (contextType === "building") {
    const building = await prisma.db.building.findFirst({
      where: {
        id: contextId,
        projectId,
        project: { builderCompanyId: companyId },
      },
      select: { id: true },
    });
    if (!building) {
      throw entityNotFound("Building");
    }
    return;
  }

  const floor = await prisma.db.floor.findFirst({
    where: {
      id: contextId,
      building: {
        projectId,
        project: { builderCompanyId: companyId },
      },
    },
    select: { id: true },
  });
  if (!floor) {
    throw entityNotFound("Floor");
  }
};

export const toDbContextType = (
  contextType: VisualMapContextType,
): DbContextType => contextType as DbContextType;

/**
 * Ensures a media asset exists and belongs to the company when ownership is set.
 */
export const requireCompanyMediaAsset = async (
  prisma: PrismaService,
  mediaAssetId: string,
  companyId: string,
): Promise<void> => {
  const asset = await prisma.db.mediaAsset.findUnique({
    where: { id: mediaAssetId },
    select: { id: true, ownerCompanyId: true },
  });
  if (!asset) {
    throw entityNotFound("Media asset");
  }
  if (asset.ownerCompanyId != null && asset.ownerCompanyId !== companyId) {
    throw entityNotFound("Media asset");
  }
};

/**
 * Clears isPrimary on sibling canvases for the same context.
 */
export const clearPrimaryForContext = async (
  prisma: PrismaService,
  input: {
    projectId: string;
    contextType: VisualMapContextType;
    contextId: string;
    excludeCanvasId?: string;
  },
): Promise<void> => {
  await prisma.db.visualMapCanvas.updateMany({
    where: {
      projectId: input.projectId,
      contextType: toDbContextType(input.contextType),
      contextId: input.contextId,
      isPrimary: true,
      ...(input.excludeCanvasId
        ? { id: { not: input.excludeCanvasId } }
        : {}),
    },
    data: { isPrimary: false },
  });
};

/**
 * Ensures only draft canvases are hard-deleted.
 */
export const assertDraftCanvasDeletable = (publicationStatus: string): void => {
  if (publicationStatus !== "draft") {
    throw new BadRequestException("Only draft visual canvases can be deleted");
  }
};
