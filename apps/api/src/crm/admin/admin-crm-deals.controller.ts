import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { CrmDealDetail, CrmDealListResponse } from '@toonexpo/contracts';

import { AccountTypes } from '../../auth/decorators/account-types.decorator.js';
import { ListAdminCrmDealsQueryDto } from '../dto/crm-deal-query.dto.js';
import { AdminCrmDealsService } from './admin-crm-deals.service.js';

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

  @Get(':id')
  @ApiOperation({ summary: 'Get CRM deal detail (read-only)' })
  @ApiOkResponse({ description: 'Deal detail' })
  getById(@Param('id') id: string): Promise<CrmDealDetail> {
    return this.deals.getById(id);
  }
}
