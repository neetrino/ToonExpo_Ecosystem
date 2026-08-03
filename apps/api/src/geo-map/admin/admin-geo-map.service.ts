import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AdminGeoMapModelItem, AdminGeoMapModelListResponse } from '@toonexpo/contracts';
import type { Prisma } from '@toonexpo/db';

import { PrismaService } from '../../prisma/prisma.service.js';
import {
  GEO_MAP_DEFAULT_ALTITUDE_M,
  GEO_MAP_DEFAULT_HEADING_DEG,
  GEO_MAP_DEFAULT_MIN_ZOOM,
  GEO_MAP_DEFAULT_PITCH_DEG,
  GEO_MAP_DEFAULT_ROLL_DEG,
  GEO_MAP_DEFAULT_SCALE,
} from '../geo-map.constants.js';
import { toAdminGeoMapModelItem } from '../mappers/geo-map.mapper.js';
import type { CreateGeoMapModelDto, UpdateGeoMapModelDto } from './dto/admin-geo-map.dto.js';

const adminInclude = {
  project: { select: { name: true, slug: true } },
  mediaAsset: { select: { fileUrl: true, title: true } },
} satisfies Prisma.ProjectMapModelInclude;

type ModelIdentity = {
  id: string;
  projectId: string | null;
  isPublished: boolean;
};

@Injectable()
export class AdminGeoMapService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<AdminGeoMapModelListResponse> {
    const rows = await this.prisma.db.projectMapModel.findMany({
      include: adminInclude,
      orderBy: [{ updatedAt: 'desc' }],
    });

    return { data: rows.map(toAdminGeoMapModelItem) };
  }

  async create(userId: string, dto: CreateGeoMapModelDto): Promise<AdminGeoMapModelItem> {
    if (dto.projectId) {
      await this.requireProject(dto.projectId);
      await this.assertNoExistingModel(dto.projectId);
    }
    await this.requireMediaAsset(dto.mediaAssetId);
    this.assertPublishAllowed(dto.isPublished ?? false, dto.projectId ?? null);

    const row = await this.prisma.db.projectMapModel.create({
      data: this.buildCreateData(userId, dto),
      include: adminInclude,
    });

    return toAdminGeoMapModelItem(row);
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateGeoMapModelDto,
  ): Promise<AdminGeoMapModelItem> {
    const existing = await this.requireModel(id);

    if (dto.mediaAssetId !== undefined) {
      await this.requireMediaAsset(dto.mediaAssetId);
    }

    if (dto.projectId !== undefined) {
      await this.requireProject(dto.projectId);
      await this.assertNoExistingModel(dto.projectId, id);
    }

    const nextProjectId = dto.projectId !== undefined ? dto.projectId : existing.projectId;
    const nextPublished = dto.isPublished !== undefined ? dto.isPublished : existing.isPublished;
    this.assertPublishAllowed(nextPublished, nextProjectId);

    const row = await this.prisma.db.projectMapModel.update({
      where: { id },
      data: this.buildUpdateData(userId, dto),
      include: adminInclude,
    });

    return toAdminGeoMapModelItem(row);
  }

  async remove(id: string): Promise<void> {
    await this.requireModel(id);
    await this.prisma.db.projectMapModel.delete({ where: { id } });
  }

  private buildCreateData(
    userId: string,
    dto: CreateGeoMapModelDto,
  ): Prisma.ProjectMapModelCreateInput {
    return {
      ...(dto.projectId ? { project: { connect: { id: dto.projectId } } } : {}),
      mediaAsset: { connect: { id: dto.mediaAssetId } },
      ...(dto.sourceOsmId !== undefined ? { sourceOsmId: dto.sourceOsmId } : {}),
      longitude: dto.longitude,
      latitude: dto.latitude,
      altitudeM: dto.altitudeM ?? GEO_MAP_DEFAULT_ALTITUDE_M,
      headingDeg: dto.headingDeg ?? GEO_MAP_DEFAULT_HEADING_DEG,
      pitchDeg: dto.pitchDeg ?? GEO_MAP_DEFAULT_PITCH_DEG,
      rollDeg: dto.rollDeg ?? GEO_MAP_DEFAULT_ROLL_DEG,
      scale: dto.scale ?? GEO_MAP_DEFAULT_SCALE,
      minZoom: dto.minZoom ?? GEO_MAP_DEFAULT_MIN_ZOOM,
      isPublished: dto.isPublished ?? false,
      createdBy: { connect: { id: userId } },
    };
  }

  private buildUpdateData(
    userId: string,
    dto: UpdateGeoMapModelDto,
  ): Prisma.ProjectMapModelUpdateInput {
    const data: Prisma.ProjectMapModelUpdateInput = {
      updatedBy: { connect: { id: userId } },
    };

    if (dto.projectId !== undefined) {
      data.project = { connect: { id: dto.projectId } };
    }
    if (dto.mediaAssetId !== undefined) {
      data.mediaAsset = { connect: { id: dto.mediaAssetId } };
    }
    if (dto.sourceOsmId !== undefined) {
      data.sourceOsmId = dto.sourceOsmId;
    }
    if (dto.longitude !== undefined) {
      data.longitude = dto.longitude;
    }
    if (dto.latitude !== undefined) {
      data.latitude = dto.latitude;
    }
    if (dto.altitudeM !== undefined) {
      data.altitudeM = dto.altitudeM;
    }
    if (dto.headingDeg !== undefined) {
      data.headingDeg = dto.headingDeg;
    }
    if (dto.pitchDeg !== undefined) {
      data.pitchDeg = dto.pitchDeg;
    }
    if (dto.rollDeg !== undefined) {
      data.rollDeg = dto.rollDeg;
    }
    if (dto.scale !== undefined) {
      data.scale = dto.scale;
    }
    if (dto.minZoom !== undefined) {
      data.minZoom = dto.minZoom;
    }
    if (dto.isPublished !== undefined) {
      data.isPublished = dto.isPublished;
    }

    return data;
  }

  private assertPublishAllowed(isPublished: boolean, projectId: string | null): void {
    if (isPublished && !projectId) {
      throw new BadRequestException('Cannot publish a geo map model without an attached project');
    }
  }

  private async requireProject(projectId: string): Promise<void> {
    const project = await this.prisma.db.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
  }

  private async requireMediaAsset(mediaAssetId: string): Promise<void> {
    const media = await this.prisma.db.mediaAsset.findUnique({
      where: { id: mediaAssetId },
      select: { id: true },
    });
    if (!media) {
      throw new NotFoundException('Media asset not found');
    }
  }

  private async requireModel(id: string): Promise<ModelIdentity> {
    const model = await this.prisma.db.projectMapModel.findUnique({
      where: { id },
      select: { id: true, projectId: true, isPublished: true },
    });
    if (!model) {
      throw new NotFoundException('Geo map model not found');
    }
    return model;
  }

  private async assertNoExistingModel(projectId: string, excludeId?: string): Promise<void> {
    const existing = await this.prisma.db.projectMapModel.findUnique({
      where: { projectId },
      select: { id: true },
    });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException('Project already has a geo map model');
    }
  }
}
