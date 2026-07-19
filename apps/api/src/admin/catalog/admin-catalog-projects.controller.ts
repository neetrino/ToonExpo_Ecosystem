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
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type {
  PortalProjectDetail,
  PortalProjectListResponse,
  ProjectQrResponse,
} from '@toonexpo/contracts';

import { AccountTypes } from '../../auth/decorators/account-types.decorator.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.js';
import { CreatePortalProjectDto } from '../../portal/dto/create-portal-project.dto.js';
import { ListPortalProjectsQueryDto } from '../../portal/dto/list-portal-projects.query.dto.js';
import { UpdatePortalProjectDto } from '../../portal/dto/update-portal-project.dto.js';
import { UpdatePortalPublicationDto } from '../../portal/dto/update-portal-publication.dto.js';
import { PortalProjectQrService } from '../../portal/projects/portal-project-qr.service.js';
import { PortalProjectsService } from '../../portal/projects/portal-projects.service.js';
import { AdminBuilderCompanyService } from './admin-builder-company.service.js';
import {
  AdminCatalogCompanyParamDto,
  AdminCatalogProjectParamDto,
} from './dto/admin-catalog.param.dto.js';

@ApiTags('admin-catalog-projects')
@AccountTypes('platform_admin')
@Controller('admin/companies/:companyId/catalog/projects')
export class AdminCatalogProjectsController {
  constructor(
    private readonly builderCompanies: AdminBuilderCompanyService,
    private readonly projectsService: PortalProjectsService,
    private readonly projectQrService: PortalProjectQrService,
  ) {}

  @Get()
  @ApiOperation({ summary: "List a builder company's projects (admin)" })
  @ApiOkResponse({ description: 'Paginated portal projects' })
  async list(
    @Param() params: AdminCatalogCompanyParamDto,
    @Query() query: ListPortalProjectsQueryDto,
  ): Promise<PortalProjectListResponse> {
    const companyId = await this.builderCompanies.requireBuilderCompanyId(params.companyId);
    return this.projectsService.list(companyId, query.page, query.pageSize);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a draft project for a company (admin)' })
  @ApiCreatedResponse({ description: 'Created project' })
  async create(
    @Param() params: AdminCatalogCompanyParamDto,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreatePortalProjectDto,
  ): Promise<PortalProjectDetail> {
    const companyId = await this.builderCompanies.requireBuilderCompanyId(params.companyId);
    return this.projectsService.create(companyId, user.id, body);
  }

  @Get(':projectId/qr')
  @ApiOperation({ summary: 'Get project QR payload URL (admin)' })
  @ApiOkResponse({ description: 'Public project page URL' })
  async getQr(@Param() params: AdminCatalogProjectParamDto): Promise<ProjectQrResponse> {
    const companyId = await this.builderCompanies.requireBuilderCompanyId(params.companyId);
    return this.projectQrService.getProjectQr(companyId, params.projectId);
  }

  @Get(':projectId')
  @ApiOperation({ summary: 'Get project detail (admin)' })
  @ApiOkResponse({ description: 'Portal project detail' })
  async getById(@Param() params: AdminCatalogProjectParamDto): Promise<PortalProjectDetail> {
    const companyId = await this.builderCompanies.requireBuilderCompanyId(params.companyId);
    return this.projectsService.getById(companyId, params.projectId);
  }

  @Patch(':projectId')
  @ApiOperation({ summary: 'Update project fields (admin)' })
  @ApiOkResponse({ description: 'Updated project' })
  async update(
    @Param() params: AdminCatalogProjectParamDto,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdatePortalProjectDto,
  ): Promise<PortalProjectDetail> {
    const companyId = await this.builderCompanies.requireBuilderCompanyId(params.companyId);
    return this.projectsService.update(companyId, user.id, params.projectId, body);
  }

  @Patch(':projectId/publication')
  @ApiOperation({ summary: 'Change project publication status (admin)' })
  @ApiOkResponse({ description: 'Updated publication status' })
  async updatePublication(
    @Param() params: AdminCatalogProjectParamDto,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdatePortalPublicationDto,
  ): Promise<PortalProjectDetail> {
    const companyId = await this.builderCompanies.requireBuilderCompanyId(params.companyId);
    return this.projectsService.updatePublication(companyId, user.id, params.projectId, body);
  }

  @Delete(':projectId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete draft project (admin)' })
  @ApiNoContentResponse({ description: 'Deleted' })
  async remove(@Param() params: AdminCatalogProjectParamDto): Promise<void> {
    const companyId = await this.builderCompanies.requireBuilderCompanyId(params.companyId);
    await this.projectsService.remove(companyId, params.projectId);
  }
}
