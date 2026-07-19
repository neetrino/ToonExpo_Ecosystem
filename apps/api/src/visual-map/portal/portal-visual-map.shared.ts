import type { Prisma } from "@toonexpo/db";

import { PrismaService } from "../../prisma/prisma.service.js";
import { entityNotFound } from "../../portal/utils/access.js";

export const canvasInclude = {
  hotspots: { orderBy: [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }] },
  mediaAsset: true,
} satisfies Prisma.VisualMapCanvasInclude;

export type OwnedCanvas = Prisma.VisualMapCanvasGetPayload<{
  include: typeof canvasInclude;
}>;

export const requireOwnedCanvas = async (
  prisma: PrismaService,
  canvasId: string,
  companyId: string,
): Promise<OwnedCanvas> => {
  const canvas = await prisma.db.visualMapCanvas.findFirst({
    where: { id: canvasId, ownerCompanyId: companyId },
    include: canvasInclude,
  });
  if (!canvas) {
    throw entityNotFound("Visual canvas");
  }
  return canvas;
};
