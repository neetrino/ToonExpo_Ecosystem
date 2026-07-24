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
  CrmActivityItem,
  CrmApartmentLinkItem,
  CrmDealDetail,
  CrmDealListResponse,
  CrmNoteItem,
  IntakeCreateResult,
} from '@toonexpo/contracts';

import { AccountTypes } from '../../auth/decorators/account-types.decorator.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.js';
import { CompanyMember } from '../../company/decorators/company-member.decorator.js';
import { CurrentCompanyMember } from '../../company/decorators/current-company-member.decorator.js';
import { CompanyMemberGuard } from '../../company/guards/company-member.guard.js';
import type { CompanyMemberContext } from '../../company/types/company-member-context.js';
import { AttachCrmDealApartmentDto } from '../dto/attach-deal-apartment.dto.js';
import { ListCrmDealsQueryDto, UpdateCrmDealDto } from '../dto/crm-deal-query.dto.js';
import {
  CreateCrmActivityDto,
  CreateCrmNoteDto,
  UpdateCrmActivityDto,
} from '../dto/crm-notes-activities.dto.js';
import { CreateDealFromScanDto, CreateManualDealDto } from '../dto/create-portal-deal.dto.js';
import { PortalCrmDealApartmentsService } from './portal-crm-deal-apartments.service.js';
import { PortalCrmDealsService } from './portal-crm-deals.service.js';
import { PortalCrmNotesActivitiesService } from './portal-crm-notes-activities.service.js';

@ApiTags('portal-crm')
@AccountTypes('company_member')
@CompanyMember({ builderOnly: true })
@UseGuards(CompanyMemberGuard)
@Controller('portal/crm/deals')
export class PortalCrmDealsController {
  constructor(
    private readonly deals: PortalCrmDealsService,
    private readonly notesActivities: PortalCrmNotesActivitiesService,
    private readonly apartments: PortalCrmDealApartmentsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List company CRM deals' })
  @ApiOkResponse({ description: 'Paginated deals' })
  list(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @Query() query: ListCrmDealsQueryDto,
  ): Promise<CrmDealListResponse> {
    return this.deals.list(member, query);
  }

  @Post('from-scan')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create deal from buyer QR scan event' })
  @ApiCreatedResponse({ description: 'Intake result' })
  createFromScan(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateDealFromScanDto,
  ): Promise<IntakeCreateResult> {
    return this.deals.createFromScan(member, user.id, body);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Manually create CRM deal/contact' })
  @ApiCreatedResponse({ description: 'Intake result' })
  createManual(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateManualDealDto,
  ): Promise<IntakeCreateResult> {
    return this.deals.createManual(member, user.id, body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get CRM deal detail' })
  @ApiOkResponse({ description: 'Deal detail' })
  getById(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @Param('id') id: string,
  ): Promise<CrmDealDetail> {
    return this.deals.getById(member, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update deal status / assignee' })
  @ApiOkResponse({ description: 'Updated deal' })
  update(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: UpdateCrmDealDto,
  ): Promise<CrmDealDetail> {
    return this.deals.update(member, id, user.id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete CRM deal' })
  @ApiNoContentResponse({ description: 'Deal deleted' })
  async remove(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @Param('id') id: string,
  ): Promise<void> {
    await this.deals.delete(member, id);
  }

  @Post(':id/apartments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Attach an apartment to a CRM deal' })
  @ApiCreatedResponse({
    description: 'Apartment link (idempotent on duplicate)',
  })
  attachApartment(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: AttachCrmDealApartmentDto,
  ): Promise<CrmApartmentLinkItem> {
    return this.apartments.attach(member, id, user.id, body.apartmentId);
  }

  @Delete(':id/apartments/:apartmentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Detach an apartment from a CRM deal' })
  @ApiNoContentResponse({ description: 'Apartment unlinked' })
  async detachApartment(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Param('apartmentId') apartmentId: string,
  ): Promise<void> {
    await this.apartments.detach(member, id, user.id, apartmentId);
  }

  @Post(':id/notes')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add internal CRM note' })
  @ApiCreatedResponse({ description: 'Created note' })
  addNote(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: CreateCrmNoteDto,
  ): Promise<CrmNoteItem> {
    return this.notesActivities.addNote(member, id, user.id, body);
  }

  @Post(':id/activities')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add CRM follow-up activity' })
  @ApiCreatedResponse({ description: 'Created activity' })
  addActivity(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: CreateCrmActivityDto,
  ): Promise<CrmActivityItem> {
    return this.notesActivities.addActivity(member, id, user.id, body);
  }

  @Patch(':id/activities/:activityId')
  @ApiOperation({ summary: 'Update CRM activity (e.g. mark done)' })
  @ApiOkResponse({ description: 'Updated activity' })
  updateActivity(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @Param('id') id: string,
    @Param('activityId') activityId: string,
    @Body() body: UpdateCrmActivityDto,
  ): Promise<CrmActivityItem> {
    return this.notesActivities.updateActivity(member, id, activityId, body);
  }
}
