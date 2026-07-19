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
  PortalVisualCanvasDetail,
  PortalVisualCanvasListResponse,
  PortalVisualHotspotItem,
} from '@toonexpo/contracts';

import { AccountTypes } from '../../auth/decorators/account-types.decorator.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.js';
import { CompanyMember } from '../../company/decorators/company-member.decorator.js';
import { CurrentCompanyMember } from '../../company/decorators/current-company-member.decorator.js';
import { CompanyMemberGuard } from '../../company/guards/company-member.guard.js';
import type { CompanyMemberContext } from '../../company/types/company-member-context.js';
import {
  CreatePortalVisualCanvasDto,
  CreatePortalVisualHotspotDto,
  UpdatePortalVisualCanvasDto,
  UpdatePortalVisualHotspotDto,
} from './dto/portal-visual-map.dto.js';
import { PortalVisualMapService } from './portal-visual-map.service.js';

@ApiTags('portal-visual-map')
@AccountTypes('company_member')
@CompanyMember({ builderOnly: true })
@UseGuards(CompanyMemberGuard)
@Controller()
export class PortalVisualMapController {
  constructor(private readonly visualMapService: PortalVisualMapService) {}

  @Get('portal/projects/:projectId/visual-canvases')
  @ApiOperation({ summary: 'List visual canvases for a project' })
  @ApiOkResponse({ description: 'Canvases with hotspot counts' })
  listByProject(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @Param('projectId') projectId: string,
  ): Promise<PortalVisualCanvasListResponse> {
    return this.visualMapService.listByProject(member.companyId, projectId);
  }

  @Post('portal/projects/:projectId/visual-canvases')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a visual canvas' })
  @ApiCreatedResponse({ description: 'Created canvas' })
  create(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId') projectId: string,
    @Body() body: CreatePortalVisualCanvasDto,
  ): Promise<PortalVisualCanvasDetail> {
    return this.visualMapService.create(member.companyId, user.id, projectId, body);
  }

  @Get('portal/visual-canvases/:id')
  @ApiOperation({ summary: 'Get visual canvas detail with hotspots' })
  @ApiOkResponse({ description: 'Canvas with target status warnings' })
  getById(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @Param('id') id: string,
  ): Promise<PortalVisualCanvasDetail> {
    return this.visualMapService.getById(member.companyId, id);
  }

  @Patch('portal/visual-canvases/:id')
  @ApiOperation({ summary: 'Update a visual canvas' })
  @ApiOkResponse({ description: 'Updated canvas' })
  update(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: UpdatePortalVisualCanvasDto,
  ): Promise<PortalVisualCanvasDetail> {
    return this.visualMapService.update(member.companyId, user.id, id, body);
  }

  @Delete('portal/visual-canvases/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete draft visual canvas' })
  @ApiNoContentResponse({ description: 'Deleted' })
  async remove(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @Param('id') id: string,
  ): Promise<void> {
    await this.visualMapService.remove(member.companyId, id);
  }

  @Post('portal/visual-canvases/:id/hotspots')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a hotspot on a canvas' })
  @ApiCreatedResponse({ description: 'Created hotspot' })
  createHotspot(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') canvasId: string,
    @Body() body: CreatePortalVisualHotspotDto,
  ): Promise<PortalVisualHotspotItem> {
    return this.visualMapService.createHotspot(member.companyId, user.id, canvasId, body);
  }

  @Patch('portal/visual-canvases/:id/hotspots/:hotspotId')
  @ApiOperation({ summary: 'Update a hotspot' })
  @ApiOkResponse({ description: 'Updated hotspot' })
  updateHotspot(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') canvasId: string,
    @Param('hotspotId') hotspotId: string,
    @Body() body: UpdatePortalVisualHotspotDto,
  ): Promise<PortalVisualHotspotItem> {
    return this.visualMapService.updateHotspot(
      member.companyId,
      user.id,
      canvasId,
      hotspotId,
      body,
    );
  }

  @Delete('portal/visual-canvases/:id/hotspots/:hotspotId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a hotspot' })
  @ApiNoContentResponse({ description: 'Deleted' })
  async removeHotspot(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @Param('id') canvasId: string,
    @Param('hotspotId') hotspotId: string,
  ): Promise<void> {
    await this.visualMapService.removeHotspot(member.companyId, canvasId, hotspotId);
  }
}
