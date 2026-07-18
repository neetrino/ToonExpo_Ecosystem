import { Injectable, NotFoundException } from "@nestjs/common";
import type { PublicVisualCanvasListResponse } from "@toonexpo/contracts";
import { PublicationStatus } from "@toonexpo/db";

import { PrismaService } from "../../prisma/prisma.service.js";
import { PUBLIC_PUBLICATION_STATUS } from "../../catalog/catalog.constants.js";
import { mapPublicCanvas } from "../mappers/visual-map.mapper.js";
import { PUBLIC_VISUAL_MAP_STATUS } from "../visual-map.constants.js";
import { loadTargetEntities } from "../utils/target-validation.js";

type PublicContextQuery = {
  contextType: "project" | "building" | "floor";
  contextId: string;
};

@Injectable()
export class PublicVisualMapService {
  constructor(private readonly prisma: PrismaService) {}

  async listForProject(projectId: string): Promise<PublicVisualCanvasListResponse> {
    const project = await this.prisma.db.project.findFirst({
      where: {
        id: projectId,
        publicationStatus: PUBLIC_PUBLICATION_STATUS,
      },
      select: { id: true },
    });
    if (!project) {
      throw new NotFoundException("Project not found");
    }

    return this.listPublishedPrimary({
      contextType: "project",
      contextId: projectId,
      projectId,
    });
  }

  async listForBuilding(buildingId: string): Promise<PublicVisualCanvasListResponse> {
    const building = await this.prisma.db.building.findFirst({
      where: {
        id: buildingId,
        publicationStatus: PUBLIC_PUBLICATION_STATUS,
        project: { publicationStatus: PUBLIC_PUBLICATION_STATUS },
      },
      select: { id: true, projectId: true },
    });
    if (!building) {
      throw new NotFoundException("Building not found");
    }

    return this.listPublishedPrimary({
      contextType: "building",
      contextId: buildingId,
      projectId: building.projectId,
    });
  }

  async listForFloor(floorId: string): Promise<PublicVisualCanvasListResponse> {
    const floor = await this.prisma.db.floor.findFirst({
      where: {
        id: floorId,
        publicationStatus: PUBLIC_PUBLICATION_STATUS,
        building: {
          publicationStatus: PUBLIC_PUBLICATION_STATUS,
          project: { publicationStatus: PUBLIC_PUBLICATION_STATUS },
        },
      },
      select: { id: true, building: { select: { projectId: true } } },
    });
    if (!floor) {
      throw new NotFoundException("Floor not found");
    }

    return this.listPublishedPrimary({
      contextType: "floor",
      contextId: floorId,
      projectId: floor.building.projectId,
    });
  }

  private async listPublishedPrimary(
    query: PublicContextQuery & { projectId: string },
  ): Promise<PublicVisualCanvasListResponse> {
    const canvases = await this.prisma.db.visualMapCanvas.findMany({
      where: {
        projectId: query.projectId,
        contextType: query.contextType,
        contextId: query.contextId,
        isPrimary: true,
        publicationStatus: PUBLIC_VISUAL_MAP_STATUS,
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: {
        mediaAsset: true,
        hotspots: {
          where: { publicationStatus: PublicationStatus.published },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        },
      },
    });

    const allHotspots = canvases.flatMap((canvas) => canvas.hotspots);
    const entities = await loadTargetEntities(this.prisma, allHotspots);

    return {
      data: canvases.map((canvas) => mapPublicCanvas(canvas, entities)),
    };
  }
}
