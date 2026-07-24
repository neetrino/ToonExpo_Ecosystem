import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { CrmDealDetail, CrmDealListResponse, IntakeCreateResult } from '@toonexpo/contracts';

import { AccountTypes } from '../../auth/decorators/account-types.decorator.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.js';
import { ListAdminCrmDealsQueryDto } from '../dto/crm-deal-query.dto.js';
import { AdminCrmDealsService } from './admin-crm-deals.service.js';
import { CreateAdminManualDealDto } from './dto/create-admin-manual-deal.dto.js';

@ApiTags('admin-crm')
@AccountTypes('platform_admin')
@Controller('admin/crm/deals')
export class AdminCrmDealsController {
  constructor(private readonly deals: AdminCrmDealsService) {}

  @Get()
  @ApiOperation({ summary: 'List CRM deals across all builder companies' })
  @ApiOkResponse({ description: 'Paginated deals with company fields' })
  list(@Query() query: ListAdminCrmDealsQueryDto): Promise<CrmDealListResponse> {
    return this.deals.list(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a manual CRM deal for a builder company' })
  @ApiCreatedResponse({ description: 'Intake result' })
  createManual(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateAdminManualDealDto,
  ): Promise<IntakeCreateResult> {
    return this.deals.createManual(user.id, body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get CRM deal detail (read-only for edits)' })
  @ApiOkResponse({ description: 'Deal detail' })
  getById(@Param('id') id: string): Promise<CrmDealDetail> {
    return this.deals.getById(id);
  }
}
