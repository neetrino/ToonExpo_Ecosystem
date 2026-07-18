import { Injectable } from "@nestjs/common";
import type {
  PortalVisualCanvasDetail,
  PortalVisualCanvasListResponse,
  PortalVisualHotspotItem,
} from "@toonexpo/contracts";
import { PublicationStatus, type Prisma } from "@toonexpo/db";

import type { CompanyMemberContext } from "../../company/types/company-member-context.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { entityNotFound } from "../../portal/utils/access.js";
import { requireOwnedProject } from "../../portal/utils/ownership.js";
import {
  mapPortalCanvasDetail,
  mapPortalCanvasListItem,
  mapPortalHotspot,
} from "../mappers/visual-map.mapper.js";
import {
  assertDraftCanvasDeletable,
  clearPrimaryForContext,
  requireCompanyMediaAsset,
  toDbContextType,
  validateCanvasContext,
} from "../utils/context-validation.js";
import { assertValidCoordinates } from "../utils/coordinates.js";
import {
  loadTargetEntities,
  toDbTargetType,
  validateHotspotTarget,
} from "../utils/target-validation.js";
import type {
  CreatePortalVisualCanvasDto,
  CreatePortalVisualHotspotDto,
  UpdatePortalVisualCanvasDto,
  UpdatePortalVisualHotspotDto,
} from "./dto/portal-visual-map.dto.js";

const canvasInclude = {
  hotspots: { orderBy: [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }] },
  mediaAsset: true,
} satisfies Prisma.VisualMapCanvasInclude;

type OwnedCanvas = Prisma.VisualMapCanvasGetPayload<{
  include: typeof canvasInclude;
}>;

@Injectable()
export class PortalVisualMapService {
  constructor(private readonly prisma: PrismaService) {}

  async listByProject(
    member: CompanyMemberContext,
    projectId: string,
  ): Promise<PortalVisualCanvasListResponse> {
    await requireOwnedProject(this.prisma, projectId, member.companyId);
    const canvases = await this.prisma.db.visualMapCanvas.findMany({
      where: { projectId, ownerCompanyId: member.companyId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: { _count: { select: { hotspots: true } } },
    });
    return { data: canvases.map(mapPortalCanvasListItem) };
  }

  async create(
    member: CompanyMemberContext,
    userId: string,
    projectId: string,
    dto: CreatePortalVisualCanvasDto,
  ): Promise<PortalVisualCanvasDetail> {
    await requireOwnedProject(this.prisma, projectId, member.companyId);
    await validateCanvasContext(this.prisma, {
      contextType: dto.contextType,
      contextId: dto.contextId,
      projectId,
      companyId: member.companyId,
    });
    await requireCompanyMediaAsset(
      this.prisma,
      dto.mediaAssetId,
      member.companyId,
    );

    if (dto.isPrimary) {
      await clearPrimaryForContext(this.prisma, {
        projectId,
        contextType: dto.contextType,
        contextId: dto.contextId,
      });
    }

    const canvas = await this.prisma.db.visualMapCanvas.create({
      data: {
        ownerCompanyId: member.companyId,
        projectId,
        contextType: toDbContextType(dto.contextType),
        contextId: dto.contextId,
        mediaAssetId: dto.mediaAssetId,
        publicationStatus: PublicationStatus.draft,
        isPrimary: dto.isPrimary ?? false,
        sortOrder: dto.sortOrder ?? 0,
        createdByUserId: userId,
        updatedByUserId: userId,
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
      },
      include: canvasInclude,
    });

    return mapPortalCanvasDetail(canvas, {
      buildings: new Map(),
      floors: new Map(),
      apartments: new Map(),
    });
  }

  async getById(
    member: CompanyMemberContext,
    canvasId: string,
  ): Promise<PortalVisualCanvasDetail> {
    const canvas = await this.requireOwnedCanvas(canvasId, member.companyId);
    const entities = await loadTargetEntities(this.prisma, canvas.hotspots);
    return mapPortalCanvasDetail(canvas, entities);
  }

  async update(
    member: CompanyMemberContext,
    userId: string,
    canvasId: string,
    dto: UpdatePortalVisualCanvasDto,
  ): Promise<PortalVisualCanvasDetail> {
    const existing = await this.requireOwnedCanvas(canvasId, member.companyId);

    if (dto.mediaAssetId) {
      await requireCompanyMediaAsset(
        this.prisma,
        dto.mediaAssetId,
        member.companyId,
      );
    }

    if (dto.isPrimary) {
      await clearPrimaryForContext(this.prisma, {
        projectId: existing.projectId,
        contextType: existing.contextType,
        contextId: existing.contextId,
        excludeCanvasId: canvasId,
      });
    }

    const canvas = await this.prisma.db.visualMapCanvas.update({
      where: { id: canvasId },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.mediaAssetId !== undefined
          ? { mediaAssetId: dto.mediaAssetId }
          : {}),
        ...(dto.isPrimary !== undefined ? { isPrimary: dto.isPrimary } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
        ...(dto.publicationStatus !== undefined
          ? { publicationStatus: dto.publicationStatus as PublicationStatus }
          : {}),
        updatedByUserId: userId,
      },
      include: canvasInclude,
    });

    const entities = await loadTargetEntities(this.prisma, canvas.hotspots);
    return mapPortalCanvasDetail(canvas, entities);
  }

  async remove(member: CompanyMemberContext, canvasId: string): Promise<void> {
    const canvas = await this.prisma.db.visualMapCanvas.findFirst({
      where: { id: canvasId, ownerCompanyId: member.companyId },
      select: { id: true, publicationStatus: true },
    });
    if (!canvas) {
      throw entityNotFound("Visual canvas");
    }
    assertDraftCanvasDeletable(canvas.publicationStatus);
    await this.prisma.db.visualMapCanvas.delete({ where: { id: canvasId } });
  }

  async createHotspot(
    member: CompanyMemberContext,
    userId: string,
    canvasId: string,
    dto: CreatePortalVisualHotspotDto,
  ): Promise<PortalVisualHotspotItem> {
    const canvas = await this.requireOwnedCanvas(canvasId, member.companyId);
    assertValidCoordinates(dto.xPercent, dto.yPercent);
    await validateHotspotTarget(this.prisma, {
      contextType: canvas.contextType,
      contextId: canvas.contextId,
      projectId: canvas.projectId,
      companyId: member.companyId,
      targetType: dto.targetType,
      targetId: dto.targetId,
    });

    const hotspot = await this.prisma.db.visualHotspot.create({
      data: {
        canvasId,
        targetType: toDbTargetType(dto.targetType),
        targetId: dto.targetId,
        label: dto.label,
        xPercent: dto.xPercent,
        yPercent: dto.yPercent,
        publicationStatus:
          (dto.publicationStatus as PublicationStatus | undefined) ??
          PublicationStatus.draft,
        createdByUserId: userId,
        updatedByUserId: userId,
        ...(dto.markerStyle !== undefined ? { markerStyle: dto.markerStyle } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      },
    });

    const entities = await loadTargetEntities(this.prisma, [hotspot]);
    return mapPortalHotspot(hotspot, entities);
  }

  async updateHotspot(
    member: CompanyMemberContext,
    userId: string,
    canvasId: string,
    hotspotId: string,
    dto: UpdatePortalVisualHotspotDto,
  ): Promise<PortalVisualHotspotItem> {
    const canvas = await this.requireOwnedCanvas(canvasId, member.companyId);
    const existing = canvas.hotspots.find((row) => row.id === hotspotId);
    if (!existing) {
      throw entityNotFound("Visual hotspot");
    }

    const nextTargetType = dto.targetType ?? existing.targetType;
    const nextTargetId = dto.targetId ?? existing.targetId;
    const nextX = dto.xPercent ?? Number(existing.xPercent);
    const nextY = dto.yPercent ?? Number(existing.yPercent);
    assertValidCoordinates(nextX, nextY);

    if (dto.targetType !== undefined || dto.targetId !== undefined) {
      await validateHotspotTarget(this.prisma, {
        contextType: canvas.contextType,
        contextId: canvas.contextId,
        projectId: canvas.projectId,
        companyId: member.companyId,
        targetType: nextTargetType,
        targetId: nextTargetId,
      });
    }

    const hotspot = await this.prisma.db.visualHotspot.update({
      where: { id: hotspotId },
      data: {
        ...(dto.targetType !== undefined
          ? { targetType: toDbTargetType(dto.targetType) }
          : {}),
        ...(dto.targetId !== undefined ? { targetId: dto.targetId } : {}),
        ...(dto.label !== undefined ? { label: dto.label } : {}),
        ...(dto.xPercent !== undefined ? { xPercent: dto.xPercent } : {}),
        ...(dto.yPercent !== undefined ? { yPercent: dto.yPercent } : {}),
        ...(dto.markerStyle !== undefined ? { markerStyle: dto.markerStyle } : {}),
        ...(dto.publicationStatus !== undefined
          ? { publicationStatus: dto.publicationStatus as PublicationStatus }
          : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
        updatedByUserId: userId,
      },
    });

    const entities = await loadTargetEntities(this.prisma, [hotspot]);
    return mapPortalHotspot(hotspot, entities);
  }

  async removeHotspot(
    member: CompanyMemberContext,
    canvasId: string,
    hotspotId: string,
  ): Promise<void> {
    await this.requireOwnedCanvas(canvasId, member.companyId);
    const hotspot = await this.prisma.db.visualHotspot.findFirst({
      where: { id: hotspotId, canvasId },
      select: { id: true },
    });
    if (!hotspot) {
      throw entityNotFound("Visual hotspot");
    }
    await this.prisma.db.visualHotspot.delete({ where: { id: hotspotId } });
  }

  private async requireOwnedCanvas(
    canvasId: string,
    companyId: string,
  ): Promise<OwnedCanvas> {
    const canvas = await this.prisma.db.visualMapCanvas.findFirst({
      where: { id: canvasId, ownerCompanyId: companyId },
      include: canvasInclude,
    });
    if (!canvas) {
      throw entityNotFound("Visual canvas");
    }
    return canvas;
  }
}
