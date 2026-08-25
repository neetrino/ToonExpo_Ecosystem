import { BadRequestException, Injectable } from '@nestjs/common';
import type { PortalBuildingSummary } from '@toonexpo/contracts';
import { PublicationStatus, type Prisma } from '@toonexpo/db';

import { WebRevalidationService } from '../../common/web-revalidation/web-revalidation.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type {
  CreatePortalBuildingDto,
  UpdatePortalBuildingDto,
} from '../dto/portal-building.dto.js';
import type { UpdatePortalPublicationDto } from '../dto/update-portal-publication.dto.js';
import { mapPortalBuilding } from '../mappers/portal.mapper.js';
import { entityNotFound } from '../utils/access.js';
import { requireOwnedBuilding, requireOwnedProject } from '../utils/ownership.js';

const buildingInclude = {
  floors: {
    orderBy: [{ displayOrder: 'asc' as const }, { number: 'asc' as const }],
    include: { _count: { select: { apartments: true } } },
  },
} satisfies Prisma.BuildingInclude;

@Injectable()
export class PortalBuildingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly webRevalidation: WebRevalidationService,
  ) {}

  async list(companyId: string, projectId: string): Promise<PortalBuildingSummary[]> {
    await requireOwnedProject(this.prisma, projectId, companyId);
    const buildings = await this.prisma.db.building.findMany({
      where: { projectId },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      include: buildingInclude,
    });
    return buildings.map(mapPortalBuilding);
  }

  async getById(companyId: string, buildingId: string): Promise<PortalBuildingSummary> {
    const owned = await requireOwnedBuilding(this.prisma, buildingId, companyId);
    const building = await this.prisma.db.building.findUniqueOrThrow({
      where: { id: owned.id },
      include: buildingInclude,
    });
    return mapPortalBuilding(building);
  }

  async create(
    companyId: string,
    userId: string,
    projectId: string,
    dto: CreatePortalBuildingDto,
  ): Promise<PortalBuildingSummary> {
    const project = await requireOwnedProject(this.prisma, projectId, companyId);
    if (dto.districtId) {
      const district = await this.prisma.db.district.findFirst({
        where: { id: dto.districtId, projectId: project.id },
        select: { id: true },
      });
      if (!district) {
        throw new BadRequestException('District not found in this project');
      }
    }
    const projectFlags = await this.prisma.db.project.findUniqueOrThrow({
      where: { id: project.id },
      select: { priceOnRequestEnabled: true },
    });
    const building = await this.prisma.db.building.create({
      data: {
        projectId: project.id,
        name: dto.name,
        publicationStatus: PublicationStatus.draft,
        displayOrder: dto.displayOrder ?? 0,
        priceOnRequestEnabled: projectFlags.priceOnRequestEnabled,
        createdByUserId: userId,
        updatedByUserId: userId,
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.floorsCount !== undefined ? { floorsCount: dto.floorsCount } : {}),
        ...(dto.coverMediaId !== undefined ? { coverMediaId: dto.coverMediaId } : {}),
        ...(dto.verified !== undefined ? { verified: dto.verified } : {}),
        ...(dto.internalCode !== undefined ? { internalCode: dto.internalCode } : {}),
        ...(dto.districtId !== undefined ? { districtId: dto.districtId } : {}),
      },
      include: buildingInclude,
    });
    return mapPortalBuilding(building);
  }

  async update(
    companyId: string,
    userId: string,
    buildingId: string,
    dto: UpdatePortalBuildingDto,
  ): Promise<PortalBuildingSummary> {
    await requireOwnedBuilding(this.prisma, buildingId, companyId);
    const building = await this.prisma.db.building.update({
      where: { id: buildingId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.displayOrder !== undefined ? { displayOrder: dto.displayOrder } : {}),
        ...(dto.floorsCount !== undefined ? { floorsCount: dto.floorsCount } : {}),
        ...(dto.coverMediaId !== undefined ? { coverMediaId: dto.coverMediaId } : {}),
        ...(dto.verified !== undefined ? { verified: dto.verified } : {}),
        ...(dto.internalCode !== undefined ? { internalCode: dto.internalCode } : {}),
        updatedByUserId: userId,
      },
      include: buildingInclude,
    });
    return mapPortalBuilding(building);
  }

  async updatePublication(
    companyId: string,
    userId: string,
    buildingId: string,
    dto: UpdatePortalPublicationDto,
  ): Promise<PortalBuildingSummary> {
    const owned = await requireOwnedBuilding(this.prisma, buildingId, companyId);
    const building = await this.prisma.db.building.update({
      where: { id: buildingId },
      data: {
        publicationStatus: dto.publicationStatus as PublicationStatus,
        updatedByUserId: userId,
      },
      include: buildingInclude,
    });
    this.webRevalidation.revalidateCatalog(owned.projectId);
    return mapPortalBuilding(building);
  }

  async updatePriceOnRequest(
    companyId: string,
    userId: string,
    buildingId: string,
    enabled: boolean,
  ): Promise<PortalBuildingSummary> {
    const owned = await requireOwnedBuilding(this.prisma, buildingId, companyId);
    const building = await this.prisma.db.building.update({
      where: { id: buildingId },
      data: {
        priceOnRequestEnabled: enabled,
        updatedByUserId: userId,
      },
      include: buildingInclude,
    });
    this.webRevalidation.revalidateCatalog(owned.projectId);
    return mapPortalBuilding(building);
  }

  async remove(companyId: string, buildingId: string): Promise<void> {
    const building = await this.prisma.db.building.findFirst({
      where: {
        id: buildingId,
        project: { builderCompanyId: companyId },
      },
      select: { id: true, projectId: true },
    });
    if (!building) {
      throw entityNotFound('Building');
    }
    await this.prisma.db.building.delete({ where: { id: buildingId } });
    this.webRevalidation.revalidateCatalog(building.projectId);
  }
}
