import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  AdminApartmentListResponse,
  AdminBuildingInventoryGlance,
  AdminBuildingListResponse,
  AdminFloorListResponse,
} from '@toonexpo/contracts';
import type { Prisma } from '@toonexpo/db';

import { summarizeSalesStatuses } from '../../catalog/mappers/catalog.mapper.js';
import { PrismaService } from '../../prisma/prisma.service.js';

/**
 * Cross-company inventory lists for the admin Projects hub.
 */
@Injectable()
export class AdminInventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async listBuildings(
    page: number,
    pageSize: number,
    companyId?: string,
  ): Promise<AdminBuildingListResponse> {
    if (companyId) {
      await this.assertCompanyExists(companyId);
    }

    const where: Prisma.BuildingWhereInput = companyId
      ? { project: { builderCompanyId: companyId } }
      : {};

    const [total, buildings] = await Promise.all([
      this.prisma.db.building.count({ where }),
      this.prisma.db.building.findMany({
        where,
        orderBy: [{ updatedAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          name: true,
          publicationStatus: true,
          createdAt: true,
          projectId: true,
          project: {
            select: {
              name: true,
              builderCompanyId: true,
              builderCompany: { select: { name: true } },
            },
          },
          _count: { select: { floors: true, apartments: true } },
        },
      }),
    ]);

    return {
      data: buildings.map((building) => ({
        id: building.id,
        name: building.name,
        publicationStatus: building.publicationStatus,
        createdAt: building.createdAt.toISOString(),
        projectId: building.projectId,
        projectName: building.project.name,
        builderCompanyId: building.project.builderCompanyId,
        companyName: building.project.builderCompany.name,
        floorsCount: building._count.floors,
        apartmentsCount: building._count.apartments,
      })),
      meta: this.toMeta(page, pageSize, total),
    };
  }

  async listFloors(
    page: number,
    pageSize: number,
    companyId?: string,
    buildingId?: string,
  ): Promise<AdminFloorListResponse> {
    if (companyId) {
      await this.assertCompanyExists(companyId);
    }
    if (buildingId) {
      await this.assertBuildingInScope(buildingId, companyId);
    }

    const where: Prisma.FloorWhereInput = {
      ...(companyId ? { building: { project: { builderCompanyId: companyId } } } : {}),
      ...(buildingId ? { buildingId } : {}),
    };

    const [total, floors] = await Promise.all([
      this.prisma.db.floor.count({ where }),
      this.prisma.db.floor.findMany({
        where,
        orderBy: [{ updatedAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          number: true,
          name: true,
          displayLabel: true,
          publicationStatus: true,
          createdAt: true,
          buildingId: true,
          building: {
            select: {
              name: true,
              projectId: true,
              project: {
                select: {
                  name: true,
                  builderCompanyId: true,
                  builderCompany: { select: { name: true } },
                },
              },
            },
          },
          _count: { select: { apartments: true } },
        },
      }),
    ]);

    return {
      data: floors.map((floor) => ({
        id: floor.id,
        number: floor.number,
        name: floor.name,
        displayLabel: floor.displayLabel,
        publicationStatus: floor.publicationStatus,
        createdAt: floor.createdAt.toISOString(),
        buildingId: floor.buildingId,
        buildingName: floor.building.name,
        projectId: floor.building.projectId,
        projectName: floor.building.project.name,
        builderCompanyId: floor.building.project.builderCompanyId,
        companyName: floor.building.project.builderCompany.name,
        apartmentsCount: floor._count.apartments,
      })),
      meta: this.toMeta(page, pageSize, total),
    };
  }

  async listApartments(
    page: number,
    pageSize: number,
    companyId?: string,
    buildingId?: string,
  ): Promise<AdminApartmentListResponse> {
    if (companyId) {
      await this.assertCompanyExists(companyId);
    }
    if (buildingId) {
      await this.assertBuildingInScope(buildingId, companyId);
    }

    const where: Prisma.ApartmentWhereInput = {
      ...(companyId ? { project: { builderCompanyId: companyId } } : {}),
      ...(buildingId ? { buildingId } : {}),
    };

    const [total, apartments] = await Promise.all([
      this.prisma.db.apartment.count({ where }),
      this.prisma.db.apartment.findMany({
        where,
        orderBy: [{ updatedAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          number: true,
          publicationStatus: true,
          salesStatus: true,
          createdAt: true,
          floorId: true,
          buildingId: true,
          projectId: true,
          floor: { select: { number: true } },
          building: { select: { name: true } },
          project: {
            select: {
              name: true,
              builderCompanyId: true,
              builderCompany: { select: { name: true } },
            },
          },
        },
      }),
    ]);

    return {
      data: apartments.map((apartment) => ({
        id: apartment.id,
        number: apartment.number,
        publicationStatus: apartment.publicationStatus,
        salesStatus: apartment.salesStatus,
        createdAt: apartment.createdAt.toISOString(),
        floorId: apartment.floorId,
        floorNumber: apartment.floor.number,
        buildingId: apartment.buildingId,
        buildingName: apartment.building.name,
        projectId: apartment.projectId,
        projectName: apartment.project.name,
        builderCompanyId: apartment.project.builderCompanyId,
        companyName: apartment.project.builderCompany.name,
      })),
      meta: this.toMeta(page, pageSize, total),
    };
  }

  /**
   * Inventory-at-a-glance for one building (totals + per-floor sales bars).
   */
  async getBuildingInventoryGlance(buildingId: string): Promise<AdminBuildingInventoryGlance> {
    const building = await this.prisma.db.building.findUnique({
      where: { id: buildingId },
      select: {
        id: true,
        name: true,
        publicationStatus: true,
        floorsCount: true,
        projectId: true,
        project: {
          select: {
            name: true,
            builderCompanyId: true,
          },
        },
        floors: {
          orderBy: [{ number: 'desc' }, { displayOrder: 'asc' }],
          select: {
            id: true,
            number: true,
            name: true,
            displayLabel: true,
            floorplanMediaId: true,
            floorplanMedia: {
              select: {
                id: true,
                fileUrl: true,
                thumbnailUrl: true,
                altText: true,
              },
            },
            apartments: { select: { salesStatus: true } },
          },
        },
        apartments: { select: { salesStatus: true } },
      },
    });

    if (!building) {
      throw new NotFoundException('Building not found');
    }

    return {
      id: building.id,
      name: building.name,
      publicationStatus: building.publicationStatus,
      floorsCount: building.floorsCount,
      projectId: building.projectId,
      projectName: building.project.name,
      builderCompanyId: building.project.builderCompanyId,
      availability: summarizeSalesStatuses(
        building.apartments.map((apartment) => apartment.salesStatus),
      ),
      floors: building.floors.map((floor) => ({
        id: floor.id,
        number: floor.number,
        name: floor.name,
        displayLabel: floor.displayLabel,
        floorplanMediaId: floor.floorplanMediaId,
        floorplan: floor.floorplanMedia
          ? {
              id: floor.floorplanMedia.id,
              fileUrl: floor.floorplanMedia.fileUrl,
              thumbnailUrl: floor.floorplanMedia.thumbnailUrl,
              altText: floor.floorplanMedia.altText,
            }
          : null,
        availability: summarizeSalesStatuses(
          floor.apartments.map((apartment) => apartment.salesStatus),
        ),
      })),
    };
  }

  private async assertCompanyExists(companyId: string): Promise<void> {
    const company = await this.prisma.db.company.findUnique({
      where: { id: companyId },
      select: { id: true },
    });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
  }

  private async assertBuildingInScope(buildingId: string, companyId?: string): Promise<void> {
    const building = await this.prisma.db.building.findUnique({
      where: { id: buildingId },
      select: {
        id: true,
        project: { select: { builderCompanyId: true } },
      },
    });
    if (!building) {
      throw new NotFoundException('Building not found');
    }
    if (companyId && building.project.builderCompanyId !== companyId) {
      throw new NotFoundException('Building not found');
    }
  }

  private toMeta(page: number, pageSize: number, total: number) {
    return {
      page,
      pageSize,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
    };
  }
}
