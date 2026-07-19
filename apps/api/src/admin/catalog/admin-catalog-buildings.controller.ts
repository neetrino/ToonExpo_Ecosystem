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
import type { PortalBuildingSummary } from '@toonexpo/contracts';

import { AccountTypes } from '../../auth/decorators/account-types.decorator.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.js';
import {
  CreatePortalBuildingDto,
  UpdatePortalBuildingDto,
} from '../../portal/dto/portal-building.dto.js';
import { UpdatePortalPublicationDto } from '../../portal/dto/update-portal-publication.dto.js';
import { PortalBuildingsService } from '../../portal/buildings/portal-buildings.service.js';
import { AdminBuilderCompanyService } from './admin-builder-company.service.js';
import {
  AdminCatalogBuildingParamDto,
  AdminCatalogProjectParamDto,
} from './dto/admin-catalog.param.dto.js';

@ApiTags('admin-catalog-buildings')
@AccountTypes('platform_admin')
@Controller()
export class AdminCatalogBuildingsController {
  constructor(
    private readonly builderCompanies: AdminBuilderCompanyService,
    private readonly buildingsService: PortalBuildingsService,
  ) {}

  @Get('admin/companies/:companyId/catalog/projects/:projectId/buildings')
  @ApiOperation({ summary: 'List buildings under a project (admin)' })
  @ApiOkResponse({ description: 'Buildings with floors' })
  async list(@Param() params: AdminCatalogProjectParamDto): Promise<PortalBuildingSummary[]> {
    const companyId = await this.builderCompanies.requireBuilderCompanyId(params.companyId);
    return this.buildingsService.list(companyId, params.projectId);
  }

  @Post('admin/companies/:companyId/catalog/projects/:projectId/buildings')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a building (admin)' })
  @ApiCreatedResponse({ description: 'Created building' })
  async create(
    @Param() params: AdminCatalogProjectParamDto,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreatePortalBuildingDto,
  ): Promise<PortalBuildingSummary> {
    const companyId = await this.builderCompanies.requireBuilderCompanyId(params.companyId);
    return this.buildingsService.create(companyId, user.id, params.projectId, body);
  }

  @Get('admin/companies/:companyId/catalog/buildings/:buildingId')
  @ApiOperation({ summary: 'Get a building (admin)' })
  @ApiOkResponse({ description: 'Building detail' })
  async getById(@Param() params: AdminCatalogBuildingParamDto): Promise<PortalBuildingSummary> {
    const companyId = await this.builderCompanies.requireBuilderCompanyId(params.companyId);
    return this.buildingsService.getById(companyId, params.buildingId);
  }

  @Patch('admin/companies/:companyId/catalog/buildings/:buildingId')
  @ApiOperation({ summary: 'Update a building (admin)' })
  @ApiOkResponse({ description: 'Updated building' })
  async update(
    @Param() params: AdminCatalogBuildingParamDto,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdatePortalBuildingDto,
  ): Promise<PortalBuildingSummary> {
    const companyId = await this.builderCompanies.requireBuilderCompanyId(params.companyId);
    return this.buildingsService.update(companyId, user.id, params.buildingId, body);
  }

  @Patch('admin/companies/:companyId/catalog/buildings/:buildingId/publication')
  @ApiOperation({ summary: 'Change building publication (admin)' })
  @ApiOkResponse({ description: 'Updated publication status' })
  async updatePublication(
    @Param() params: AdminCatalogBuildingParamDto,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdatePortalPublicationDto,
  ): Promise<PortalBuildingSummary> {
    const companyId = await this.builderCompanies.requireBuilderCompanyId(params.companyId);
    return this.buildingsService.updatePublication(companyId, user.id, params.buildingId, body);
  }

  @Delete('admin/companies/:companyId/catalog/buildings/:buildingId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete draft building (admin)' })
  @ApiNoContentResponse({ description: 'Deleted' })
  async remove(@Param() params: AdminCatalogBuildingParamDto): Promise<void> {
    const companyId = await this.builderCompanies.requireBuilderCompanyId(params.companyId);
    await this.buildingsService.remove(companyId, params.buildingId);
  }
}
