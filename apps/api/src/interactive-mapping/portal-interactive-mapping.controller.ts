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
  UseGuards,
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
import { CompanyMember } from '../company/decorators/company-member.decorator.js';
import { CurrentCompanyMember } from '../company/decorators/current-company-member.decorator.js';
import { CompanyMemberGuard } from '../company/guards/company-member.guard.js';
import type { CompanyMemberContext } from '../company/types/company-member-context.js';
import {
  CreateDistrictDto,
  InteractiveMappingBuildingParamDto,
  InteractiveMappingDistrictParamDto,
  InteractiveMappingProjectParamDto,
  SetupBuildingFloorsDto,
  UpdateDistrictDto,
} from './interactive-mapping.dto.js';
import { InteractiveMappingService } from './interactive-mapping.service.js';

/**
 * Builder-portal interactive mapping — same operations as admin, scoped to
 * the caller's company only (cross-company → 404).
 */
@ApiTags('portal-interactive-mapping')
@AccountTypes('company_member')
@CompanyMember({ builderOnly: true })
@UseGuards(CompanyMemberGuard)
@Controller('portal/interactive-mapping')
export class PortalInteractiveMappingController {
  constructor(private readonly interactiveMapping: InteractiveMappingService) {}

  @Get('projects')
  @ApiOperation({ summary: 'List own projects with interactive mapping progress' })
  @ApiOkResponse({ description: 'Company projects with phase progress' })
  listProjects(
    @CurrentCompanyMember() member: CompanyMemberContext,
  ): Promise<InteractiveMappingProjectListResponse> {
    return this.interactiveMapping.listProjects(member.companyId);
  }

  @Get('projects/:projectId')
  @ApiOperation({ summary: 'Get own interactive mapping project detail' })
  @ApiOkResponse({ description: 'Project entities and canvases' })
  getProject(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @Param() params: InteractiveMappingProjectParamDto,
  ): Promise<InteractiveMappingProjectDetail> {
    return this.interactiveMapping.getProject(params.projectId, member.companyId);
  }

  @Post('projects/:projectId/districts')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a district under an owned project' })
  @ApiCreatedResponse({ description: 'Created district' })
  createDistrict(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @Param() params: InteractiveMappingProjectParamDto,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateDistrictDto,
  ): Promise<InteractiveMappingDistrictSummary> {
    return this.interactiveMapping.createDistrict(
      params.projectId,
      user.id,
      body,
      member.companyId,
    );
  }

  @Patch('districts/:districtId')
  @ApiOperation({ summary: 'Update an owned district' })
  @ApiOkResponse({ description: 'Updated district' })
  updateDistrict(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @Param() params: InteractiveMappingDistrictParamDto,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateDistrictDto,
  ): Promise<InteractiveMappingDistrictSummary> {
    return this.interactiveMapping.updateDistrict(
      params.districtId,
      user.id,
      body,
      member.companyId,
    );
  }

  @Delete('districts/:districtId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an owned district' })
  @ApiNoContentResponse({ description: 'District deleted' })
  async deleteDistrict(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @Param() params: InteractiveMappingDistrictParamDto,
  ): Promise<void> {
    await this.interactiveMapping.deleteDistrict(params.districtId, member.companyId);
  }

  @Post('buildings/:buildingId/setup-floors')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Ensure floors for an owned building' })
  @ApiCreatedResponse({ description: 'Floors ensured' })
  setupFloors(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @Param() params: InteractiveMappingBuildingParamDto,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: SetupBuildingFloorsDto,
  ): Promise<SetupBuildingFloorsResponse> {
    return this.interactiveMapping.setupFloors(params.buildingId, user.id, body, member.companyId);
  }
}
