import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AdminProjectListResponse } from '@toonexpo/contracts';

import { AccountTypes } from '../../auth/decorators/account-types.decorator.js';
import { AdminCompaniesService } from './admin-companies.service.js';
import { ListAdminProjectsQueryDto } from './dto/list-admin-projects.query.dto.js';

@ApiTags('admin-projects')
@AccountTypes('platform_admin')
@Controller('admin/projects')
export class AdminProjectsController {
  constructor(private readonly companiesService: AdminCompaniesService) {}

  @Get()
  @ApiOperation({ summary: 'List all projects across companies (optional company filter)' })
  @ApiOkResponse({ description: 'Paginated admin projects list' })
  list(@Query() query: ListAdminProjectsQueryDto): Promise<AdminProjectListResponse> {
    return this.companiesService.listAllProjects(query.page, query.pageSize, query.companyId);
  }
}
