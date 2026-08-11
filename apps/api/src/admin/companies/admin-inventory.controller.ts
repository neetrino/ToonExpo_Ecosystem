import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type {
  AdminApartmentListResponse,
  AdminBuildingInventoryGlance,
  AdminBuildingListResponse,
  AdminFloorListResponse,
  FeaturedOnHomeResponse,
} from '@toonexpo/contracts';

import { AccountTypes } from '../../auth/decorators/account-types.decorator.js';
import { AdminHomeFeaturedService } from './admin-home-featured.service.js';
import { AdminInventoryService } from './admin-inventory.service.js';
import { AdminApartmentIdParamDto } from './dto/admin-apartment-id.param.dto.js';
import { AdminBuildingIdParamDto } from './dto/admin-building-id.param.dto.js';
import { ListAdminProjectsQueryDto } from './dto/list-admin-projects.query.dto.js';
import { SetFeaturedOnHomeDto } from './dto/set-featured-on-home.dto.js';

@ApiTags('admin-inventory')
@AccountTypes('platform_admin')
@Controller()
export class AdminInventoryController {
  constructor(
    private readonly inventoryService: AdminInventoryService,
    private readonly homeFeaturedService: AdminHomeFeaturedService,
  ) {}

  @Get('admin/buildings')
  @ApiOperation({ summary: 'List buildings across companies' })
  @ApiOkResponse({ description: 'Paginated buildings list' })
  listBuildings(@Query() query: ListAdminProjectsQueryDto): Promise<AdminBuildingListResponse> {
    return this.inventoryService.listBuildings(
      query.page,
      query.pageSize,
      query.companyId,
      query.projectId,
    );
  }

  @Get('admin/buildings/:buildingId/inventory-glance')
  @ApiOperation({ summary: 'Building inventory glance (floors + sales mix)' })
  @ApiOkResponse({ description: 'Inventory glance for one building' })
  getBuildingInventoryGlance(
    @Param() params: AdminBuildingIdParamDto,
  ): Promise<AdminBuildingInventoryGlance> {
    return this.inventoryService.getBuildingInventoryGlance(params.buildingId);
  }

  @Get('admin/floors')
  @ApiOperation({ summary: 'List floors across companies' })
  @ApiOkResponse({ description: 'Paginated floors list' })
  listFloors(@Query() query: ListAdminProjectsQueryDto): Promise<AdminFloorListResponse> {
    return this.inventoryService.listFloors(
      query.page,
      query.pageSize,
      query.companyId,
      query.buildingId,
    );
  }

  @Get('admin/apartments')
  @ApiOperation({ summary: 'List apartments across companies' })
  @ApiOkResponse({ description: 'Paginated apartments list' })
  listApartments(@Query() query: ListAdminProjectsQueryDto): Promise<AdminApartmentListResponse> {
    return this.inventoryService.listApartments(
      query.page,
      query.pageSize,
      query.companyId,
      query.buildingId,
    );
  }

  @Patch('admin/apartments/:apartmentId/featured-on-home')
  @ApiOperation({ summary: 'Pin or unpin an apartment on the public homepage (max 6)' })
  @ApiOkResponse({ description: 'Updated featured-on-home flag' })
  setApartmentFeaturedOnHome(
    @Param() params: AdminApartmentIdParamDto,
    @Body() body: SetFeaturedOnHomeDto,
  ): Promise<FeaturedOnHomeResponse> {
    return this.homeFeaturedService.setApartmentFeaturedOnHome(
      params.apartmentId,
      body.featuredOnHome,
    );
  }
}
