import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { PortalFloorSummary } from '@toonexpo/contracts';

import { AccountTypes } from '../../auth/decorators/account-types.decorator.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.js';
import { CreatePortalFloorDto, UpdatePortalFloorDto } from '../../portal/dto/portal-floor.dto.js';
import { UpdatePortalPublicationDto } from '../../portal/dto/update-portal-publication.dto.js';
import { PortalFloorsService } from '../../portal/floors/portal-floors.service.js';
import { AdminBuilderCompanyService } from './admin-builder-company.service.js';
import {
  AdminCatalogBuildingParamDto,
  AdminCatalogFloorParamDto,
} from './dto/admin-catalog.param.dto.js';

@ApiTags('admin-catalog-floors')
@AccountTypes('platform_admin')
@Controller()
export class AdminCatalogFloorsController {
  constructor(
    private readonly builderCompanies: AdminBuilderCompanyService,
    private readonly floorsService: PortalFloorsService,
  ) {}

  @Get('admin/companies/:companyId/catalog/buildings/:buildingId/floors')
  @ApiOperation({ summary: 'List floors under a building (admin)' })
  @ApiOkResponse({ description: 'Floors' })
  async list(@Param() params: AdminCatalogBuildingParamDto): Promise<PortalFloorSummary[]> {
    const companyId = await this.builderCompanies.requireBuilderCompanyId(params.companyId);
    return this.floorsService.list(companyId, params.buildingId);
  }

  @Post('admin/companies/:companyId/catalog/buildings/:buildingId/floors')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a floor (admin)' })
  @ApiCreatedResponse({ description: 'Created floor' })
  async create(
    @Param() params: AdminCatalogBuildingParamDto,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreatePortalFloorDto,
  ): Promise<PortalFloorSummary> {
    const companyId = await this.builderCompanies.requireBuilderCompanyId(params.companyId);
    return this.floorsService.create(companyId, user.id, params.buildingId, body);
  }

  @Patch('admin/companies/:companyId/catalog/floors/:floorId')
  @ApiOperation({ summary: 'Update a floor (admin)' })
  @ApiOkResponse({ description: 'Updated floor' })
  async update(
    @Param() params: AdminCatalogFloorParamDto,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdatePortalFloorDto,
  ): Promise<PortalFloorSummary> {
    const companyId = await this.builderCompanies.requireBuilderCompanyId(params.companyId);
    return this.floorsService.update(companyId, user.id, params.floorId, body);
  }

  @Patch('admin/companies/:companyId/catalog/floors/:floorId/publication')
  @ApiOperation({ summary: 'Change floor publication (admin)' })
  @ApiOkResponse({ description: 'Updated publication status' })
  async updatePublication(
    @Param() params: AdminCatalogFloorParamDto,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdatePortalPublicationDto,
  ): Promise<PortalFloorSummary> {
    const companyId = await this.builderCompanies.requireBuilderCompanyId(params.companyId);
    return this.floorsService.updatePublication(companyId, user.id, params.floorId, body);
  }

  @Delete('admin/companies/:companyId/catalog/floors/:floorId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete draft floor (admin)' })
  @ApiNoContentResponse({ description: 'Deleted' })
  async remove(@Param() params: AdminCatalogFloorParamDto): Promise<void> {
    const companyId = await this.builderCompanies.requireBuilderCompanyId(params.companyId);
    await this.floorsService.remove(companyId, params.floorId);
  }
}
