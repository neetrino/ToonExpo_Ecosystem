import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  AdminApartmentListResponse,
  AdminBuildingInventoryGlance,
  AdminBuildingListResponse,
  AdminFloorListResponse,
} from '@toonexpo/contracts';

import { InventoryHubService } from '../../inventory/inventory-hub.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';

const toIdList = (value: string | readonly string[] | undefined): string[] => {
  if (value == null) {
    return [];
  }
  const list = Array.isArray(value) ? [...value] : [value];
  return list.map((id) => id.trim()).filter((id) => id.length > 0);
};

/**
 * Cross-company inventory lists for the admin Projects hub.
 */
@Injectable()
export class AdminInventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryHub: InventoryHubService,
  ) {}

  async listBuildings(
    page: number,
    pageSize: number,
    companyId?: string | readonly string[],
    projectId?: string,
    search?: string,
  ): Promise<AdminBuildingListResponse> {
    const companyIds = toIdList(companyId);
    if (companyIds.length === 1) {
      await this.assertCompanyExists(companyIds[0]!);
    }
    if (projectId) {
      await this.assertProjectInScope(projectId, companyIds[0]);
    }
    return this.inventoryHub.listBuildings(page, pageSize, companyIds, projectId, search);
  }

  async listFloors(
    page: number,
    pageSize: number,
    companyId?: string | readonly string[],
    buildingId?: string | readonly string[],
    search?: string,
  ): Promise<AdminFloorListResponse> {
    const companyIds = toIdList(companyId);
    const buildingIds = toIdList(buildingId);
    if (companyIds.length === 1) {
      await this.assertCompanyExists(companyIds[0]!);
    }
    if (buildingIds.length === 1) {
      await this.assertBuildingInScope(buildingIds[0]!, companyIds[0]);
    }
    return this.inventoryHub.listFloors(page, pageSize, companyIds, buildingIds, search);
  }

  async listApartments(
    page: number,
    pageSize: number,
    companyId?: string | readonly string[],
    buildingId?: string | readonly string[],
    floorId?: string | readonly string[],
    search?: string,
  ): Promise<AdminApartmentListResponse> {
    const companyIds = toIdList(companyId);
    const buildingIds = toIdList(buildingId);
    const floorIds = toIdList(floorId);
    if (companyIds.length === 1) {
      await this.assertCompanyExists(companyIds[0]!);
    }
    if (buildingIds.length === 1) {
      await this.assertBuildingInScope(buildingIds[0]!, companyIds[0]);
    }
    if (floorIds.length === 1) {
      await this.assertFloorInScope(floorIds[0]!, buildingIds[0], companyIds[0]);
    }
    return this.inventoryHub.listApartments(
      page,
      pageSize,
      companyIds,
      buildingIds,
      floorIds,
      search,
    );
  }

  /**
   * Inventory-at-a-glance for one building (admin Buildings hub sheet).
   */
  getBuildingInventoryGlance(buildingId: string): Promise<AdminBuildingInventoryGlance> {
    return this.inventoryHub.getBuildingInventoryGlance(buildingId);
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

  private async assertProjectInScope(projectId: string, companyId?: string): Promise<void> {
    const project = await this.prisma.db.project.findUnique({
      where: { id: projectId },
      select: { id: true, builderCompanyId: true },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (companyId && project.builderCompanyId !== companyId) {
      throw new NotFoundException('Project not found');
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

  private async assertFloorInScope(
    floorId: string,
    buildingId?: string,
    companyId?: string,
  ): Promise<void> {
    const floor = await this.prisma.db.floor.findUnique({
      where: { id: floorId },
      select: {
        id: true,
        buildingId: true,
        building: { select: { project: { select: { builderCompanyId: true } } } },
      },
    });
    if (!floor) {
      throw new NotFoundException('Floor not found');
    }
    if (buildingId && floor.buildingId !== buildingId) {
      throw new NotFoundException('Floor not found');
    }
    if (companyId && floor.building.project.builderCompanyId !== companyId) {
      throw new NotFoundException('Floor not found');
    }
  }
}
