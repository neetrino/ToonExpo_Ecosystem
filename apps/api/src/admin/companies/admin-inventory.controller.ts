import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type {
  AdminApartmentListResponse,
  AdminBuildingListResponse,
  AdminFloorListResponse,
} from '@toonexpo/contracts';

import { AccountTypes } from '../../auth/decorators/account-types.decorator.js';
import { AdminInventoryService } from './admin-inventory.service.js';
import { ListAdminProjectsQueryDto } from './dto/list-admin-projects.query.dto.js';

@ApiTags('admin-inventory')
@AccountTypes('platform_admin')
@Controller()
export class AdminInventoryController {
  constructor(private readonly inventoryService: AdminInventoryService) {}

  @Get('admin/buildings')
  @ApiOperation({ summary: 'List buildings across companies' })
  @ApiOkResponse({ description: 'Paginated buildings list' })
  listBuildings(@Query() query: ListAdminProjectsQueryDto): Promise<AdminBuildingListResponse> {
    return this.inventoryService.listBuildings(query.page, query.pageSize, query.companyId);
  }

  @Get('admin/floors')
  @ApiOperation({ summary: 'List floors across companies' })
  @ApiOkResponse({ description: 'Paginated floors list' })
  listFloors(@Query() query: ListAdminProjectsQueryDto): Promise<AdminFloorListResponse> {
    return this.inventoryService.listFloors(query.page, query.pageSize, query.companyId);
  }

  @Get('admin/apartments')
  @ApiOperation({ summary: 'List apartments across companies' })
  @ApiOkResponse({ description: 'Paginated apartments list' })
  listApartments(@Query() query: ListAdminProjectsQueryDto): Promise<AdminApartmentListResponse> {
    return this.inventoryService.listApartments(query.page, query.pageSize, query.companyId);
  }
}
