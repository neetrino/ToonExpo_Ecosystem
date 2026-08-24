import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type {
  AdminApartmentListResponse,
  AdminBuildingInventoryGlance,
  AdminBuildingListResponse,
  AdminFloorListResponse,
} from '@toonexpo/contracts';

import { AccountTypes } from '../../auth/decorators/account-types.decorator.js';
import { CompanyMember } from '../../company/decorators/company-member.decorator.js';
import { CurrentCompanyMember } from '../../company/decorators/current-company-member.decorator.js';
import { CompanyMemberGuard } from '../../company/guards/company-member.guard.js';
import type { CompanyMemberContext } from '../../company/types/company-member-context.js';
import { InventoryHubService } from '../../inventory/inventory-hub.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ListPortalInventoryQueryDto } from '../dto/list-portal-inventory.query.dto.js';
import { requireOwnedBuilding, requireOwnedProject } from '../utils/ownership.js';

@ApiTags('portal-inventory')
@AccountTypes('company_member')
@CompanyMember({ builderOnly: true })
@UseGuards(CompanyMemberGuard)
@Controller()
export class PortalInventoryController {
  constructor(
    private readonly inventoryHub: InventoryHubService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('portal/buildings')
  @ApiOperation({ summary: 'List company buildings' })
  @ApiOkResponse({ description: 'Paginated buildings list' })
  async listBuildings(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @Query() query: ListPortalInventoryQueryDto,
  ): Promise<AdminBuildingListResponse> {
    if (query.projectId) {
      await requireOwnedProject(this.prisma, query.projectId, member.companyId);
    }
    return this.inventoryHub.listBuildings(
      query.page,
      query.pageSize,
      member.companyId,
      query.projectId,
      query.search,
    );
  }

  @Get('portal/buildings/:buildingId/inventory-glance')
  @ApiOperation({ summary: 'Building inventory glance (floors + sales mix)' })
  @ApiOkResponse({ description: 'Inventory glance for one owned building' })
  async getBuildingInventoryGlance(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @Param('buildingId') buildingId: string,
  ): Promise<AdminBuildingInventoryGlance> {
    await requireOwnedBuilding(this.prisma, buildingId, member.companyId);
    return this.inventoryHub.getBuildingInventoryGlance(buildingId);
  }

  @Get('portal/floors')
  @ApiOperation({ summary: 'List company floors' })
  @ApiOkResponse({ description: 'Paginated floors list' })
  async listFloors(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @Query() query: ListPortalInventoryQueryDto,
  ): Promise<AdminFloorListResponse> {
    if (query.buildingId) {
      await requireOwnedBuilding(this.prisma, query.buildingId, member.companyId);
    }
    return this.inventoryHub.listFloors(
      query.page,
      query.pageSize,
      member.companyId,
      query.buildingId,
      query.search,
    );
  }

  @Get('portal/apartments')
  @ApiOperation({ summary: 'List company apartments' })
  @ApiOkResponse({ description: 'Paginated apartments list' })
  async listApartments(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @Query() query: ListPortalInventoryQueryDto,
  ): Promise<AdminApartmentListResponse> {
    if (query.buildingId) {
      await requireOwnedBuilding(this.prisma, query.buildingId, member.companyId);
    }
    return this.inventoryHub.listApartments(
      query.page,
      query.pageSize,
      member.companyId,
      query.buildingId,
      undefined,
      query.search,
    );
  }
}
