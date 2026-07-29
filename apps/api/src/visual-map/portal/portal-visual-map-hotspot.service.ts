import { Injectable } from '@nestjs/common';
import type { PortalVisualHotspotItem, VisualHotspotTargetType } from '@toonexpo/contracts';
import { Prisma, PublicationStatus } from '@toonexpo/db';

import { WebRevalidationService } from '../../common/web-revalidation/web-revalidation.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { entityNotFound } from '../../portal/utils/access.js';
import { mapPortalHotspot } from '../mappers/visual-map.mapper.js';
import { assertValidCoordinates } from '../utils/coordinates.js';
import {
  loadTargetEntities,
  toDbTargetType,
  validateHotspotTarget,
} from '../utils/target-validation.js';
import type {
  CreatePortalVisualHotspotDto,
  UpdatePortalVisualHotspotDto,
} from './dto/portal-visual-map.dto.js';
import { requireOwnedCanvas, type OwnedCanvas } from './portal-visual-map.shared.js';

/**
 * Defaults hotspot publication to match a published parent canvas (public map readiness).
 */
const resolveHotspotPublicationStatus = (
  canvas: OwnedCanvas,
  requested: PublicationStatus | undefined,
): PublicationStatus => {
  if (requested !== undefined) {
    return requested;
  }
  return canvas.publicationStatus === PublicationStatus.published
    ? PublicationStatus.published
    : PublicationStatus.draft;
};

/**
 * Publishes hotspot targets so public map filtering does not drop Admin-drawn polygons.
 */
const ensurePublishedHotspotTarget = async (
  prisma: PrismaService,
  targetType: VisualHotspotTargetType,
  targetId: string,
): Promise<void> => {
  if (targetType === 'district') {
    await prisma.db.district.updateMany({
      where: {
        id: targetId,
        publicationStatus: { not: PublicationStatus.published },
      },
      data: { publicationStatus: PublicationStatus.published },
    });
    return;
  }

  if (targetType === 'building') {
    await prisma.db.building.updateMany({
      where: {
        id: targetId,
        publicationStatus: { not: PublicationStatus.published },
      },
      data: { publicationStatus: PublicationStatus.published },
    });
  }
};

@Injectable()
export class PortalVisualMapHotspotService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly webRevalidation: WebRevalidationService,
  ) {}

  async create(
    companyId: string,
    userId: string,
    canvasId: string,
    dto: CreatePortalVisualHotspotDto,
  ): Promise<PortalVisualHotspotItem> {
    const canvas = await requireOwnedCanvas(this.prisma, canvasId, companyId);
    assertValidCoordinates(dto.xPercent, dto.yPercent);
    await validateHotspotTarget(this.prisma, {
      contextType: canvas.contextType,
      contextId: canvas.contextId,
      projectId: canvas.projectId,
      companyId: companyId,
      targetType: dto.targetType,
      targetId: dto.targetId,
    });

    if (canvas.contextType === 'district' && dto.targetType === 'building') {
      await this.prisma.db.building.updateMany({
        where: {
          id: dto.targetId,
          projectId: canvas.projectId,
          districtId: null,
        },
        data: { districtId: canvas.contextId },
      });
    }

    const publicationStatus = resolveHotspotPublicationStatus(
      canvas,
      dto.publicationStatus as PublicationStatus | undefined,
    );

    if (publicationStatus === PublicationStatus.published) {
      await ensurePublishedHotspotTarget(this.prisma, dto.targetType, dto.targetId);
    }

    const hotspot = await this.prisma.db.visualHotspot.create({
      data: {
        canvasId,
        targetType: toDbTargetType(dto.targetType),
        targetId: dto.targetId,
        label: dto.label,
        xPercent: dto.xPercent,
        yPercent: dto.yPercent,
        shapeType: dto.shapeType ?? 'point',
        interactionType:
          dto.interactionType ??
          (dto.shapeType === 'polygon' ? 'polygon' : dto.svgPath ? 'both' : 'marker'),
        svgPath: dto.svgPath ?? null,
        ...(dto.points !== undefined ? { points: dto.points as Prisma.InputJsonValue } : {}),
        publicationStatus,
        createdByUserId: userId,
        updatedByUserId: userId,
        ...(dto.markerStyle !== undefined ? { markerStyle: dto.markerStyle } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      },
    });

    const entities = await loadTargetEntities(this.prisma, [hotspot]);
    if (publicationStatus === PublicationStatus.published) {
      this.webRevalidation.revalidateVisualMap();
    }
    return mapPortalHotspot(hotspot, entities);
  }

  async update(
    companyId: string,
    userId: string,
    canvasId: string,
    hotspotId: string,
    dto: UpdatePortalVisualHotspotDto,
  ): Promise<PortalVisualHotspotItem> {
    const canvas = await requireOwnedCanvas(this.prisma, canvasId, companyId);
    const existing = canvas.hotspots.find((row) => row.id === hotspotId);
    if (!existing) {
      throw entityNotFound('Visual hotspot');
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
        companyId: companyId,
        targetType: nextTargetType,
        targetId: nextTargetId,
      });

      if (canvas.contextType === 'district' && nextTargetType === 'building') {
        await this.prisma.db.building.updateMany({
          where: {
            id: nextTargetId,
            projectId: canvas.projectId,
            districtId: null,
          },
          data: { districtId: canvas.contextId },
        });
      }
    }

    const publicationStatus =
      dto.publicationStatus !== undefined
        ? (dto.publicationStatus as PublicationStatus)
        : canvas.publicationStatus === PublicationStatus.published &&
            existing.publicationStatus !== PublicationStatus.published
          ? PublicationStatus.published
          : undefined;

    if ((publicationStatus ?? existing.publicationStatus) === PublicationStatus.published) {
      await ensurePublishedHotspotTarget(
        this.prisma,
        nextTargetType as VisualHotspotTargetType,
        nextTargetId,
      );
    }

    const hotspot = await this.prisma.db.visualHotspot.update({
      where: { id: hotspotId },
      data: {
        ...(dto.targetType !== undefined ? { targetType: toDbTargetType(dto.targetType) } : {}),
        ...(dto.targetId !== undefined ? { targetId: dto.targetId } : {}),
        ...(dto.label !== undefined ? { label: dto.label } : {}),
        ...(dto.xPercent !== undefined ? { xPercent: dto.xPercent } : {}),
        ...(dto.yPercent !== undefined ? { yPercent: dto.yPercent } : {}),
        ...(dto.shapeType !== undefined ? { shapeType: dto.shapeType } : {}),
        ...(dto.interactionType !== undefined ? { interactionType: dto.interactionType } : {}),
        ...(dto.svgPath !== undefined ? { svgPath: dto.svgPath } : {}),
        ...(dto.points !== undefined ? { points: dto.points as Prisma.InputJsonValue } : {}),
        ...(dto.markerStyle !== undefined ? { markerStyle: dto.markerStyle } : {}),
        ...(publicationStatus !== undefined ? { publicationStatus } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
        updatedByUserId: userId,
      },
    });

    const entities = await loadTargetEntities(this.prisma, [hotspot]);
    if (publicationStatus !== undefined || dto.svgPath !== undefined) {
      this.webRevalidation.revalidateVisualMap();
    }
    return mapPortalHotspot(hotspot, entities);
  }

  async remove(companyId: string, canvasId: string, hotspotId: string): Promise<void> {
    await requireOwnedCanvas(this.prisma, canvasId, companyId);
    const hotspot = await this.prisma.db.visualHotspot.findFirst({
      where: { id: hotspotId, canvasId },
      select: { id: true },
    });
    if (!hotspot) {
      throw entityNotFound('Visual hotspot');
    }
    await this.prisma.db.visualHotspot.delete({ where: { id: hotspotId } });
  }
}
