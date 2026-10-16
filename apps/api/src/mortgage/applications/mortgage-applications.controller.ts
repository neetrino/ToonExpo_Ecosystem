import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type {
  CreateMortgageApplicationResult,
  PortalMortgageApplicationListResponse,
} from '@toonexpo/contracts';

import { AccountTypes } from '../../auth/decorators/account-types.decorator.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.js';
import { CompanyMember } from '../../company/decorators/company-member.decorator.js';
import { CurrentCompanyMember } from '../../company/decorators/current-company-member.decorator.js';
import { CompanyMemberGuard } from '../../company/guards/company-member.guard.js';
import type { CompanyMemberContext } from '../../company/types/company-member-context.js';
import { CreateMortgageApplicationDto } from '../public/dto/create-mortgage-application.dto.js';
import { MortgageApplicationService } from './mortgage-application.service.js';

@ApiTags('mortgage-applications')
@Controller()
export class MortgageApplicationsController {
  constructor(private readonly applications: MortgageApplicationService) {}

  @Post('mortgage/applications')
  @AccountTypes('buyer')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send a mortgage application to the selected bank' })
  @ApiCreatedResponse({ description: 'Application stored for the bank' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateMortgageApplicationDto,
  ): Promise<CreateMortgageApplicationResult> {
    return this.applications.create(user.id, body);
  }

  @Get('portal/bank-offers/applications')
  @AccountTypes('company_member')
  @CompanyMember()
  @UseGuards(CompanyMemberGuard)
  @ApiOperation({ summary: 'List mortgage applications sent to this bank' })
  @ApiOkResponse({ description: 'Applications for the bank partner' })
  list(
    @CurrentCompanyMember() member: CompanyMemberContext,
  ): Promise<PortalMortgageApplicationListResponse> {
    return this.applications.listForPartner(member);
  }
}
