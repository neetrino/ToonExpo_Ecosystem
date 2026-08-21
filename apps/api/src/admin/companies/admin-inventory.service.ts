import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  AdminApartmentListResponse,
  AdminBuildingInventoryGlance,
  AdminBuildingListResponse,
  AdminFloorListResponse,
} from '@toonexpo/contracts';

import { InventoryHubService } from '../../inventory/inventory-hub.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';

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
    companyId?: string,
    projectId?: string,
    search?: string,
  ): Promise<AdminBuildingListResponse> {
    if (companyId) {
      await this.assertCompanyExists(companyId);
    }
    if (projectId) {
      await this.assertProjectInScope(projectId, companyId);
    }
    return this.inventoryHub.listBuildings(page, pageSize, companyId, projectId, search);
  }

  async listFloors(
    page: number,
    pageSize: number,
    companyId?: string,
    buildingId?: string,
    search?: string,
  ): Promise<AdminFloorListResponse> {
    if (companyId) {
      await this.assertCompanyExists(companyId);
    }
    if (buildingId) {
      await this.assertBuildingInScope(buildingId, companyId);
    }
    return this.inventoryHub.listFloors(page, pageSize, companyId, buildingId, search);
  }

  async listApartments(
    page: number,
    pageSize: number,
    companyId?: string,
    buildingId?: string,
    search?: string,
  ): Promise<AdminApartmentListResponse> {
    if (companyId) {
      await this.assertCompanyExists(companyId);
    }
    if (buildingId) {
      await this.assertBuildingInScope(buildingId, companyId);
    }
    return this.inventoryHub.listApartments(page, pageSize, companyId, buildingId, search);
  }

  /**
   * Inventory-at-a-glance for one building (totals + per-floor sales bars).
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
}
