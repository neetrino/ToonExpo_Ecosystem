import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { ReadinessCriterionItem } from '@toonexpo/contracts';

import { AccountTypes } from '../../auth/decorators/account-types.decorator.js';
import { AdminReadinessCriteriaService } from './admin-readiness-criteria.service.js';
import { UpdateReadinessCriterionDto } from './dto/readiness-criterion.dto.js';

@ApiTags('admin-readiness-criteria')
@AccountTypes('platform_admin')
@Controller('admin/readiness/criteria')
export class AdminReadinessCriteriaController {
  constructor(private readonly criteria: AdminReadinessCriteriaService) {}

  @Patch(':id')
  @ApiOperation({ summary: 'Link a service provider category to a KPI criterion' })
  @ApiOkResponse({ description: 'Updated criterion' })
  update(
    @Param('id') id: string,
    @Body() body: UpdateReadinessCriterionDto,
  ): Promise<ReadinessCriterionItem> {
    return this.criteria.update(id, body);
  }
}
