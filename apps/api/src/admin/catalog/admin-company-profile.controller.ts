import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { CompanyProfileResponse } from '@toonexpo/contracts';
import { CompanyMemberRole } from '@toonexpo/db';

import { AccountTypes } from '../../auth/decorators/account-types.decorator.js';
import { CompanyProfileService } from '../../company/company-profile.service.js';
import { UpdateCompanyProfileDto } from '../../company/dto/update-company-profile.dto.js';
import { AdminBuilderCompanyService } from './admin-builder-company.service.js';
import { AdminCatalogCompanyParamDto } from './dto/admin-catalog.param.dto.js';

@ApiTags('admin-company-profile')
@AccountTypes('platform_admin')
@Controller('admin/companies/:companyId/profile')
export class AdminCompanyProfileController {
  constructor(
    private readonly builderCompanies: AdminBuilderCompanyService,
    private readonly profileService: CompanyProfileService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get a company profile (admin)' })
  @ApiOkResponse({ description: 'Company profile' })
  async get(@Param() params: AdminCatalogCompanyParamDto): Promise<CompanyProfileResponse> {
    const companyId = await this.builderCompanies.requireBuilderCompanyId(params.companyId);
    return this.profileService.getByCompanyId(companyId, CompanyMemberRole.company_admin);
  }

  @Patch()
  @ApiOperation({ summary: 'Update a company profile logo (admin)' })
  @ApiOkResponse({ description: 'Updated company profile' })
  async update(
    @Param() params: AdminCatalogCompanyParamDto,
    @Body() body: UpdateCompanyProfileDto,
  ): Promise<CompanyProfileResponse> {
    const companyId = await this.builderCompanies.requireBuilderCompanyId(params.companyId);
    return this.profileService.updateByCompanyId(companyId, body);
  }
}
