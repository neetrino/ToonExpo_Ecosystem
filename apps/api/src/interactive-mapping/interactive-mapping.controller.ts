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
  InteractiveMappingDistrictSummary,
  InteractiveMappingProjectDetail,
  InteractiveMappingProjectListResponse,
  SetupBuildingFloorsResponse,
} from '@toonexpo/contracts';

import { AccountTypes } from '../auth/decorators/account-types.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';
import {
  CreateDistrictDto,
  InteractiveMappingBuildingParamDto,
  InteractiveMappingDistrictParamDto,
  InteractiveMappingProjectParamDto,
  ListInteractiveMappingProjectsQueryDto,
  SetupBuildingFloorsDto,
  UpdateDistrictDto,
} from './interactive-mapping.dto.js';
import { InteractiveMappingService } from './interactive-mapping.service.js';

@ApiTags('admin-interactive-mapping')
@AccountTypes('platform_admin')
@Controller('admin/interactive-mapping')
export class InteractiveMappingController {
  constructor(private readonly interactiveMapping: InteractiveMappingService) {}

  @Get('projects')
  @ApiOperation({ summary: 'List projects with interactive mapping phase progress' })
  @ApiOkResponse({ description: 'Projects with phase progress' })
  listProjects(
    @Query() query: ListInteractiveMappingProjectsQueryDto,
  ): Promise<InteractiveMappingProjectListResponse> {
    return this.interactiveMapping.listProjects(
      undefined,
      query.page,
      query.pageSize,
      query.search,
    );
  }

  @Get('projects/:projectId')
  @ApiOperation({ summary: 'Get interactive mapping project detail' })
  @ApiOkResponse({ description: 'Project entities and canvases' })
  getProject(
    @Param() params: InteractiveMappingProjectParamDto,
  ): Promise<InteractiveMappingProjectDetail> {
    return this.interactiveMapping.getProject(params.projectId);
  }

  @Post('projects/:projectId/districts')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a district under a project' })
  @ApiCreatedResponse({ description: 'Created district' })
  createDistrict(
    @Param() params: InteractiveMappingProjectParamDto,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateDistrictDto,
  ): Promise<InteractiveMappingDistrictSummary> {
    return this.interactiveMapping.createDistrict(params.projectId, user.id, body);
  }

  @Patch('districts/:districtId')
  @ApiOperation({ summary: 'Update a district' })
  @ApiOkResponse({ description: 'Updated district' })
  updateDistrict(
    @Param() params: InteractiveMappingDistrictParamDto,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateDistrictDto,
  ): Promise<InteractiveMappingDistrictSummary> {
    return this.interactiveMapping.updateDistrict(params.districtId, user.id, body);
  }

  @Delete('districts/:districtId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a district' })
  @ApiNoContentResponse({ description: 'District deleted' })
  async deleteDistrict(@Param() params: InteractiveMappingDistrictParamDto): Promise<void> {
    await this.interactiveMapping.deleteDistrict(params.districtId);
  }

  @Post('buildings/:buildingId/setup-floors')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Ensure floor rows and optional building render canvas' })
  @ApiCreatedResponse({ description: 'Floors ensured' })
  setupFloors(
    @Param() params: InteractiveMappingBuildingParamDto,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: SetupBuildingFloorsDto,
  ): Promise<SetupBuildingFloorsResponse> {
    return this.interactiveMapping.setupFloors(params.buildingId, user.id, body);
  }
}
