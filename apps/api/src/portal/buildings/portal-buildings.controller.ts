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
import type { PortalBuildingSummary } from '@toonexpo/contracts';

import { AccountTypes } from '../../auth/decorators/account-types.decorator.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.js';
import { CompanyMember } from '../../company/decorators/company-member.decorator.js';
import { CurrentCompanyMember } from '../../company/decorators/current-company-member.decorator.js';
import { CompanyMemberGuard } from '../../company/guards/company-member.guard.js';
import type { CompanyMemberContext } from '../../company/types/company-member-context.js';
import { assertCompanyAdmin } from '../utils/access.js';
import { CreatePortalBuildingDto, UpdatePortalBuildingDto } from '../dto/portal-building.dto.js';
import { UpdatePortalPublicationDto } from '../dto/update-portal-publication.dto.js';
import { PortalBuildingsService } from './portal-buildings.service.js';

@ApiTags('portal-buildings')
@AccountTypes('company_member')
@CompanyMember({ builderOnly: true })
@UseGuards(CompanyMemberGuard)
@Controller()
export class PortalBuildingsController {
  constructor(private readonly buildingsService: PortalBuildingsService) {}

  @Get('portal/projects/:projectId/buildings')
  @ApiOperation({ summary: 'List buildings under a project' })
  @ApiOkResponse({ description: 'Buildings with floors' })
  list(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @Param('projectId') projectId: string,
  ): Promise<PortalBuildingSummary[]> {
    return this.buildingsService.list(member.companyId, projectId);
  }

  @Post('portal/projects/:projectId/buildings')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a building under a project' })
  @ApiCreatedResponse({ description: 'Created building' })
  create(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId') projectId: string,
    @Body() body: CreatePortalBuildingDto,
  ): Promise<PortalBuildingSummary> {
    return this.buildingsService.create(member.companyId, user.id, projectId, body);
  }

  @Get('portal/buildings/:buildingId')
  @ApiOperation({ summary: 'Get a building by id' })
  @ApiOkResponse({ description: 'Building detail' })
  getById(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @Param('buildingId') buildingId: string,
  ): Promise<PortalBuildingSummary> {
    return this.buildingsService.getById(member.companyId, buildingId);
  }

  @Patch('portal/buildings/:buildingId')
  @ApiOperation({ summary: 'Update a building' })
  @ApiOkResponse({ description: 'Updated building' })
  update(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('buildingId') buildingId: string,
    @Body() body: UpdatePortalBuildingDto,
  ): Promise<PortalBuildingSummary> {
    return this.buildingsService.update(member.companyId, user.id, buildingId, body);
  }

  @Patch('portal/buildings/:buildingId/publication')
  @ApiOperation({ summary: 'Change building publication (company_admin)' })
  @ApiOkResponse({ description: 'Updated publication status' })
  updatePublication(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('buildingId') buildingId: string,
    @Body() body: UpdatePortalPublicationDto,
  ): Promise<PortalBuildingSummary> {
    assertCompanyAdmin(member);
    return this.buildingsService.updatePublication(member.companyId, user.id, buildingId, body);
  }

  @Delete('portal/buildings/:buildingId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete draft building (company_admin)' })
  @ApiNoContentResponse({ description: 'Deleted' })
  async remove(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @Param('buildingId') buildingId: string,
  ): Promise<void> {
    assertCompanyAdmin(member);
    await this.buildingsService.remove(member.companyId, buildingId);
  }
}
