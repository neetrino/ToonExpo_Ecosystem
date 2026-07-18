import { Injectable } from "@nestjs/common";
import type { PortalVisualHotspotItem } from "@toonexpo/contracts";
import { PublicationStatus } from "@toonexpo/db";

import type { CompanyMemberContext } from "../../company/types/company-member-context.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { entityNotFound } from "../../portal/utils/access.js";
import { mapPortalHotspot } from "../mappers/visual-map.mapper.js";
import { assertValidCoordinates } from "../utils/coordinates.js";
import {
  loadTargetEntities,
  toDbTargetType,
  validateHotspotTarget,
} from "../utils/target-validation.js";
import type {
  CreatePortalVisualHotspotDto,
  UpdatePortalVisualHotspotDto,
} from "./dto/portal-visual-map.dto.js";
import { requireOwnedCanvas } from "./portal-visual-map.shared.js";

@Injectable()
export class PortalVisualMapHotspotService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    member: CompanyMemberContext,
    userId: string,
    canvasId: string,
    dto: CreatePortalVisualHotspotDto,
  ): Promise<PortalVisualHotspotItem> {
    const canvas = await requireOwnedCanvas(
      this.prisma,
      canvasId,
      member.companyId,
    );
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

  async update(
    member: CompanyMemberContext,
    userId: string,
    canvasId: string,
    hotspotId: string,
    dto: UpdatePortalVisualHotspotDto,
  ): Promise<PortalVisualHotspotItem> {
    const canvas = await requireOwnedCanvas(
      this.prisma,
      canvasId,
      member.companyId,
    );
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

  async remove(
    member: CompanyMemberContext,
    canvasId: string,
    hotspotId: string,
  ): Promise<void> {
    await requireOwnedCanvas(this.prisma, canvasId, member.companyId);
    const hotspot = await this.prisma.db.visualHotspot.findFirst({
      where: { id: hotspotId, canvasId },
      select: { id: true },
    });
    if (!hotspot) {
      throw entityNotFound("Visual hotspot");
    }
    await this.prisma.db.visualHotspot.delete({ where: { id: hotspotId } });
  }
}
