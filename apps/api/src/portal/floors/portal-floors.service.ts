import { BadRequestException, Injectable } from '@nestjs/common';
import type { PortalFloorSummary } from '@toonexpo/contracts';
import { PublicationStatus, type Prisma } from '@toonexpo/db';

import { WebRevalidationService } from '../../common/web-revalidation/web-revalidation.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { CreatePortalFloorDto, UpdatePortalFloorDto } from '../dto/portal-floor.dto.js';
import type { UpdatePortalPublicationDto } from '../dto/update-portal-publication.dto.js';
import { mapPortalFloor } from '../mappers/portal.mapper.js';
import { entityNotFound } from '../utils/access.js';
import { requireOwnedBuilding, requireOwnedFloor } from '../utils/ownership.js';

const floorInclude = {
  _count: { select: { apartments: true } },
} satisfies Prisma.FloorInclude;

@Injectable()
export class PortalFloorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly webRevalidation: WebRevalidationService,
  ) {}

  async list(companyId: string, buildingId: string): Promise<PortalFloorSummary[]> {
    await requireOwnedBuilding(this.prisma, buildingId, companyId);
    const floors = await this.prisma.db.floor.findMany({
      where: { buildingId },
      orderBy: [{ displayOrder: 'asc' }, { number: 'asc' }],
      include: floorInclude,
    });
    return floors.map(mapPortalFloor);
  }

  async create(
    companyId: string,
    userId: string,
    buildingId: string,
    dto: CreatePortalFloorDto,
  ): Promise<PortalFloorSummary> {
    await requireOwnedBuilding(this.prisma, buildingId, companyId);
    const floor = await this.prisma.db.floor.create({
      data: {
        buildingId,
        number: dto.floorNumber,
        publicationStatus: PublicationStatus.draft,
        displayOrder: dto.displayOrder ?? 0,
        createdByUserId: userId,
        updatedByUserId: userId,
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.displayLabel !== undefined ? { displayLabel: dto.displayLabel } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.floorplanMediaId !== undefined ? { floorplanMediaId: dto.floorplanMediaId } : {}),
      },
      include: floorInclude,
    });
    return mapPortalFloor(floor);
  }

  async update(
    companyId: string,
    userId: string,
    floorId: string,
    dto: UpdatePortalFloorDto,
  ): Promise<PortalFloorSummary> {
    await requireOwnedFloor(this.prisma, floorId, companyId);
    const floor = await this.prisma.db.floor.update({
      where: { id: floorId },
      data: {
        ...(dto.floorNumber !== undefined ? { number: dto.floorNumber } : {}),
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.displayLabel !== undefined ? { displayLabel: dto.displayLabel } : {}),
        ...(dto.displayOrder !== undefined ? { displayOrder: dto.displayOrder } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.floorplanMediaId !== undefined ? { floorplanMediaId: dto.floorplanMediaId } : {}),
        updatedByUserId: userId,
      },
      include: floorInclude,
    });
    return mapPortalFloor(floor);
  }

  async updatePublication(
    companyId: string,
    userId: string,
    floorId: string,
    dto: UpdatePortalPublicationDto,
  ): Promise<PortalFloorSummary> {
    const owned = await requireOwnedFloor(this.prisma, floorId, companyId);
    const floor = await this.prisma.db.floor.update({
      where: { id: floorId },
      data: {
        publicationStatus: dto.publicationStatus as PublicationStatus,
        updatedByUserId: userId,
      },
      include: floorInclude,
    });
    this.webRevalidation.revalidateCatalog(owned.building.projectId);
    return mapPortalFloor(floor);
  }

  async remove(companyId: string, floorId: string): Promise<void> {
    const floor = await this.prisma.db.floor.findFirst({
      where: {
        id: floorId,
        building: { project: { builderCompanyId: companyId } },
      },
      select: { id: true, publicationStatus: true },
    });
    if (!floor) {
      throw entityNotFound('Floor');
    }
    if (floor.publicationStatus !== PublicationStatus.draft) {
      throw new BadRequestException('Only draft floors can be deleted');
    }
    await this.prisma.db.floor.delete({ where: { id: floorId } });
  }
}
