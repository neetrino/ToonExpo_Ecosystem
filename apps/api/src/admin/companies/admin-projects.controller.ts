import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type {
  AdminProjectListResponse,
  AdminProjectScope,
  FeaturedOnHomeResponse,
} from '@toonexpo/contracts';

import { AccountTypes } from '../../auth/decorators/account-types.decorator.js';
import { AdminCompaniesService } from './admin-companies.service.js';
import { AdminHomeFeaturedService } from './admin-home-featured.service.js';
import { AdminProjectIdParamDto } from './dto/admin-project-id.param.dto.js';
import { ListAdminProjectsQueryDto } from './dto/list-admin-projects.query.dto.js';
import { SetFeaturedOnHomeDto } from './dto/set-featured-on-home.dto.js';

@ApiTags('admin-projects')
@AccountTypes('platform_admin')
@Controller('admin/projects')
export class AdminProjectsController {
  constructor(
    private readonly companiesService: AdminCompaniesService,
    private readonly homeFeaturedService: AdminHomeFeaturedService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List all projects across companies (optional company filter and search)',
  })
  @ApiOkResponse({ description: 'Paginated admin projects list' })
  list(@Query() query: ListAdminProjectsQueryDto): Promise<AdminProjectListResponse> {
    return this.companiesService.listAllProjects(
      query.page,
      query.pageSize,
      query.companyId?.[0],
      query.search,
    );
  }

  @Get(':projectId/scope')
  @ApiOperation({ summary: 'Resolve builder company id for an admin project route' })
  @ApiOkResponse({ description: 'Project scope' })
  getScope(@Param() params: AdminProjectIdParamDto): Promise<AdminProjectScope> {
    return this.companiesService.getProjectScope(params.projectId);
  }

  @Patch(':projectId/featured-on-home')
  @ApiOperation({ summary: 'Pin or unpin a project on the public homepage (max 3)' })
  @ApiOkResponse({ description: 'Updated featured-on-home flag' })
  setFeaturedOnHome(
    @Param() params: AdminProjectIdParamDto,
    @Body() body: SetFeaturedOnHomeDto,
  ): Promise<FeaturedOnHomeResponse> {
    return this.homeFeaturedService.setProjectFeaturedOnHome(
      params.projectId,
      body.featuredOnHome,
    );
  }
}
