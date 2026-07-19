import { Injectable } from '@nestjs/common';
import type { PortalVisualCanvasDetail, PortalVisualCanvasListResponse } from '@toonexpo/contracts';
import { PublicationStatus } from '@toonexpo/db';

import { WebRevalidationService } from '../../common/web-revalidation/web-revalidation.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { entityNotFound } from '../../portal/utils/access.js';
import { requireOwnedProject } from '../../portal/utils/ownership.js';
import { mapPortalCanvasDetail, mapPortalCanvasListItem } from '../mappers/visual-map.mapper.js';
import {
  assertDraftCanvasDeletable,
  clearPrimaryForContext,
  requireCompanyMediaAsset,
  toDbContextType,
  validateCanvasContext,
} from '../utils/context-validation.js';
import { loadTargetEntities } from '../utils/target-validation.js';
import type {
  CreatePortalVisualCanvasDto,
  UpdatePortalVisualCanvasDto,
} from './dto/portal-visual-map.dto.js';
import { canvasInclude, requireOwnedCanvas } from './portal-visual-map.shared.js';

@Injectable()
export class PortalVisualMapCanvasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly webRevalidation: WebRevalidationService,
  ) {}

  async listByProject(
    companyId: string,
    projectId: string,
  ): Promise<PortalVisualCanvasListResponse> {
    await requireOwnedProject(this.prisma, projectId, companyId);
    const canvases = await this.prisma.db.visualMapCanvas.findMany({
      where: { projectId, ownerCompanyId: companyId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      include: { _count: { select: { hotspots: true } } },
    });
    return { data: canvases.map(mapPortalCanvasListItem) };
  }

  async create(
    companyId: string,
    userId: string,
    projectId: string,
    dto: CreatePortalVisualCanvasDto,
  ): Promise<PortalVisualCanvasDetail> {
    await requireOwnedProject(this.prisma, projectId, companyId);
    await validateCanvasContext(this.prisma, {
      contextType: dto.contextType,
      contextId: dto.contextId,
      projectId,
      companyId: companyId,
    });
    await requireCompanyMediaAsset(this.prisma, dto.mediaAssetId, companyId);

    if (dto.isPrimary) {
      await clearPrimaryForContext(this.prisma, {
        projectId,
        contextType: dto.contextType,
        contextId: dto.contextId,
      });
    }

    const canvas = await this.prisma.db.visualMapCanvas.create({
      data: {
        ownerCompanyId: companyId,
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

  async getById(companyId: string, canvasId: string): Promise<PortalVisualCanvasDetail> {
    const canvas = await requireOwnedCanvas(this.prisma, canvasId, companyId);
    const entities = await loadTargetEntities(this.prisma, canvas.hotspots);
    return mapPortalCanvasDetail(canvas, entities);
  }

  async update(
    companyId: string,
    userId: string,
    canvasId: string,
    dto: UpdatePortalVisualCanvasDto,
  ): Promise<PortalVisualCanvasDetail> {
    const existing = await requireOwnedCanvas(this.prisma, canvasId, companyId);

    if (dto.mediaAssetId) {
      await requireCompanyMediaAsset(this.prisma, dto.mediaAssetId, companyId);
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
        ...(dto.mediaAssetId !== undefined ? { mediaAssetId: dto.mediaAssetId } : {}),
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
    if (dto.publicationStatus !== undefined) {
      this.webRevalidation.revalidateVisualMap();
    }
    return mapPortalCanvasDetail(canvas, entities);
  }

  async remove(companyId: string, canvasId: string): Promise<void> {
    const canvas = await this.prisma.db.visualMapCanvas.findFirst({
      where: { id: canvasId, ownerCompanyId: companyId },
      select: { id: true, publicationStatus: true },
    });
    if (!canvas) {
      throw entityNotFound('Visual canvas');
    }
    assertDraftCanvasDeletable(canvas.publicationStatus);
    await this.prisma.db.visualMapCanvas.delete({ where: { id: canvasId } });
  }
}
