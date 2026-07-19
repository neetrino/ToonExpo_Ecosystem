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
import type {
  PortalVisualCanvasDetail,
  PortalVisualCanvasListResponse,
  PortalVisualHotspotItem,
} from '@toonexpo/contracts';

import { AccountTypes } from '../../auth/decorators/account-types.decorator.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.js';
import {
  CreatePortalVisualCanvasDto,
  CreatePortalVisualHotspotDto,
  UpdatePortalVisualCanvasDto,
  UpdatePortalVisualHotspotDto,
} from '../../visual-map/portal/dto/portal-visual-map.dto.js';
import { PortalVisualMapService } from '../../visual-map/portal/portal-visual-map.service.js';
import { AdminBuilderCompanyService } from './admin-builder-company.service.js';
import {
  AdminCatalogCanvasParamDto,
  AdminCatalogHotspotParamDto,
  AdminCatalogProjectParamDto,
} from './dto/admin-catalog.param.dto.js';

@ApiTags('admin-catalog-visual-map')
@AccountTypes('platform_admin')
@Controller()
export class AdminCatalogVisualMapController {
  constructor(
    private readonly builderCompanies: AdminBuilderCompanyService,
    private readonly visualMapService: PortalVisualMapService,
  ) {}

  @Get('admin/companies/:companyId/catalog/projects/:projectId/visual-canvases')
  @ApiOperation({ summary: 'List visual canvases for a project (admin)' })
  @ApiOkResponse({ description: 'Canvases with hotspot counts' })
  async listByProject(
    @Param() params: AdminCatalogProjectParamDto,
  ): Promise<PortalVisualCanvasListResponse> {
    const companyId = await this.builderCompanies.requireBuilderCompanyId(params.companyId);
    return this.visualMapService.listByProject(companyId, params.projectId);
  }

  @Post('admin/companies/:companyId/catalog/projects/:projectId/visual-canvases')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a visual canvas (admin)' })
  @ApiCreatedResponse({ description: 'Created canvas' })
  async create(
    @Param() params: AdminCatalogProjectParamDto,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreatePortalVisualCanvasDto,
  ): Promise<PortalVisualCanvasDetail> {
    const companyId = await this.builderCompanies.requireBuilderCompanyId(params.companyId);
    return this.visualMapService.create(companyId, user.id, params.projectId, body);
  }

  @Get('admin/companies/:companyId/catalog/visual-canvases/:id')
  @ApiOperation({ summary: 'Get visual canvas detail (admin)' })
  @ApiOkResponse({ description: 'Canvas with target status warnings' })
  async getById(@Param() params: AdminCatalogCanvasParamDto): Promise<PortalVisualCanvasDetail> {
    const companyId = await this.builderCompanies.requireBuilderCompanyId(params.companyId);
    return this.visualMapService.getById(companyId, params.id);
  }

  @Patch('admin/companies/:companyId/catalog/visual-canvases/:id')
  @ApiOperation({ summary: 'Update a visual canvas (admin)' })
  @ApiOkResponse({ description: 'Updated canvas' })
  async update(
    @Param() params: AdminCatalogCanvasParamDto,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdatePortalVisualCanvasDto,
  ): Promise<PortalVisualCanvasDetail> {
    const companyId = await this.builderCompanies.requireBuilderCompanyId(params.companyId);
    return this.visualMapService.update(companyId, user.id, params.id, body);
  }

  @Delete('admin/companies/:companyId/catalog/visual-canvases/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete draft visual canvas (admin)' })
  @ApiNoContentResponse({ description: 'Deleted' })
  async remove(@Param() params: AdminCatalogCanvasParamDto): Promise<void> {
    const companyId = await this.builderCompanies.requireBuilderCompanyId(params.companyId);
    await this.visualMapService.remove(companyId, params.id);
  }

  @Post('admin/companies/:companyId/catalog/visual-canvases/:id/hotspots')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a hotspot (admin)' })
  @ApiCreatedResponse({ description: 'Created hotspot' })
  async createHotspot(
    @Param() params: AdminCatalogCanvasParamDto,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreatePortalVisualHotspotDto,
  ): Promise<PortalVisualHotspotItem> {
    const companyId = await this.builderCompanies.requireBuilderCompanyId(params.companyId);
    return this.visualMapService.createHotspot(companyId, user.id, params.id, body);
  }

  @Patch('admin/companies/:companyId/catalog/visual-canvases/:id/hotspots/:hotspotId')
  @ApiOperation({ summary: 'Update a hotspot (admin)' })
  @ApiOkResponse({ description: 'Updated hotspot' })
  async updateHotspot(
    @Param() params: AdminCatalogHotspotParamDto,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdatePortalVisualHotspotDto,
  ): Promise<PortalVisualHotspotItem> {
    const companyId = await this.builderCompanies.requireBuilderCompanyId(params.companyId);
    return this.visualMapService.updateHotspot(
      companyId,
      user.id,
      params.id,
      params.hotspotId,
      body,
    );
  }

  @Delete('admin/companies/:companyId/catalog/visual-canvases/:id/hotspots/:hotspotId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a hotspot (admin)' })
  @ApiNoContentResponse({ description: 'Deleted' })
  async removeHotspot(@Param() params: AdminCatalogHotspotParamDto): Promise<void> {
    const companyId = await this.builderCompanies.requireBuilderCompanyId(params.companyId);
    await this.visualMapService.removeHotspot(companyId, params.id, params.hotspotId);
  }
}
