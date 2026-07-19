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
import type { PortalFloorSummary } from '@toonexpo/contracts';

import { AccountTypes } from '../../auth/decorators/account-types.decorator.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.js';
import { CompanyMember } from '../../company/decorators/company-member.decorator.js';
import { CurrentCompanyMember } from '../../company/decorators/current-company-member.decorator.js';
import { CompanyMemberGuard } from '../../company/guards/company-member.guard.js';
import type { CompanyMemberContext } from '../../company/types/company-member-context.js';
import { assertCompanyAdmin } from '../utils/access.js';
import { CreatePortalFloorDto, UpdatePortalFloorDto } from '../dto/portal-floor.dto.js';
import { UpdatePortalPublicationDto } from '../dto/update-portal-publication.dto.js';
import { PortalFloorsService } from './portal-floors.service.js';

@ApiTags('portal-floors')
@AccountTypes('company_member')
@CompanyMember({ builderOnly: true })
@UseGuards(CompanyMemberGuard)
@Controller()
export class PortalFloorsController {
  constructor(private readonly floorsService: PortalFloorsService) {}

  @Get('portal/buildings/:buildingId/floors')
  @ApiOperation({ summary: 'List floors under a building' })
  @ApiOkResponse({ description: 'Floors' })
  list(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @Param('buildingId') buildingId: string,
  ): Promise<PortalFloorSummary[]> {
    return this.floorsService.list(member.companyId, buildingId);
  }

  @Post('portal/buildings/:buildingId/floors')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a floor under a building' })
  @ApiCreatedResponse({ description: 'Created floor' })
  create(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('buildingId') buildingId: string,
    @Body() body: CreatePortalFloorDto,
  ): Promise<PortalFloorSummary> {
    return this.floorsService.create(member.companyId, user.id, buildingId, body);
  }

  @Patch('portal/floors/:floorId')
  @ApiOperation({ summary: 'Update a floor' })
  @ApiOkResponse({ description: 'Updated floor' })
  update(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('floorId') floorId: string,
    @Body() body: UpdatePortalFloorDto,
  ): Promise<PortalFloorSummary> {
    return this.floorsService.update(member.companyId, user.id, floorId, body);
  }

  @Patch('portal/floors/:floorId/publication')
  @ApiOperation({ summary: 'Change floor publication (company_admin)' })
  @ApiOkResponse({ description: 'Updated publication status' })
  updatePublication(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('floorId') floorId: string,
    @Body() body: UpdatePortalPublicationDto,
  ): Promise<PortalFloorSummary> {
    assertCompanyAdmin(member);
    return this.floorsService.updatePublication(member.companyId, user.id, floorId, body);
  }

  @Delete('portal/floors/:floorId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete draft floor (company_admin)' })
  @ApiNoContentResponse({ description: 'Deleted' })
  async remove(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @Param('floorId') floorId: string,
  ): Promise<void> {
    assertCompanyAdmin(member);
    await this.floorsService.remove(member.companyId, floorId);
  }
}
