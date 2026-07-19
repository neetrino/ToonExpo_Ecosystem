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
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { PortalApartmentDetail } from '@toonexpo/contracts';

import { AccountTypes } from '../../auth/decorators/account-types.decorator.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.js';
import {
  BulkCreatePortalApartmentsDto,
  CreatePortalApartmentDto,
  UpdatePortalApartmentDto,
} from '../../portal/dto/portal-apartment.dto.js';
import { UpdatePortalPublicationDto } from '../../portal/dto/update-portal-publication.dto.js';
import { PortalApartmentsService } from '../../portal/apartments/portal-apartments.service.js';
import { AdminBuilderCompanyService } from './admin-builder-company.service.js';
import {
  AdminCatalogApartmentParamDto,
  AdminCatalogFloorParamDto,
} from './dto/admin-catalog.param.dto.js';

@ApiTags('admin-catalog-apartments')
@AccountTypes('platform_admin')
@Controller()
export class AdminCatalogApartmentsController {
  constructor(
    private readonly builderCompanies: AdminBuilderCompanyService,
    private readonly apartmentsService: PortalApartmentsService,
  ) {}

  @Get('admin/companies/:companyId/catalog/floors/:floorId/apartments')
  @ApiOperation({ summary: 'List apartments on a floor (admin)' })
  @ApiOkResponse({ description: 'Apartments' })
  async list(@Param() params: AdminCatalogFloorParamDto): Promise<PortalApartmentDetail[]> {
    const companyId = await this.builderCompanies.requireBuilderCompanyId(params.companyId);
    return this.apartmentsService.listByFloor(companyId, params.floorId);
  }

  @Post('admin/companies/:companyId/catalog/floors/:floorId/apartments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an apartment (admin)' })
  @ApiCreatedResponse({ description: 'Created apartment' })
  async create(
    @Param() params: AdminCatalogFloorParamDto,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreatePortalApartmentDto,
  ): Promise<PortalApartmentDetail> {
    const companyId = await this.builderCompanies.requireBuilderCompanyId(params.companyId);
    return this.apartmentsService.create(companyId, user.id, params.floorId, body);
  }

  @Post('admin/companies/:companyId/catalog/floors/:floorId/apartments/bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Bulk-create apartments (admin)' })
  @ApiCreatedResponse({ description: 'Created apartments' })
  async createBulk(
    @Param() params: AdminCatalogFloorParamDto,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: BulkCreatePortalApartmentsDto,
  ): Promise<PortalApartmentDetail[]> {
    const companyId = await this.builderCompanies.requireBuilderCompanyId(params.companyId);
    return this.apartmentsService.createBulk(companyId, user.id, params.floorId, body);
  }

  @Get('admin/companies/:companyId/catalog/apartments/:apartmentId')
  @ApiOperation({ summary: 'Get apartment detail (admin)' })
  @ApiOkResponse({ description: 'Apartment detail' })
  async getById(@Param() params: AdminCatalogApartmentParamDto): Promise<PortalApartmentDetail> {
    const companyId = await this.builderCompanies.requireBuilderCompanyId(params.companyId);
    return this.apartmentsService.getById(companyId, params.apartmentId);
  }

  @Patch('admin/companies/:companyId/catalog/apartments/:apartmentId')
  @ApiOperation({ summary: 'Update apartment (admin)' })
  @ApiOkResponse({ description: 'Updated apartment' })
  async update(
    @Param() params: AdminCatalogApartmentParamDto,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdatePortalApartmentDto,
  ): Promise<PortalApartmentDetail> {
    const companyId = await this.builderCompanies.requireBuilderCompanyId(params.companyId);
    return this.apartmentsService.update(companyId, user.id, params.apartmentId, body);
  }

  @Patch('admin/companies/:companyId/catalog/apartments/:apartmentId/publication')
  @ApiOperation({ summary: 'Change apartment publication (admin)' })
  @ApiOkResponse({ description: 'Updated publication status' })
  async updatePublication(
    @Param() params: AdminCatalogApartmentParamDto,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdatePortalPublicationDto,
  ): Promise<PortalApartmentDetail> {
    const companyId = await this.builderCompanies.requireBuilderCompanyId(params.companyId);
    return this.apartmentsService.updatePublication(companyId, user.id, params.apartmentId, body);
  }

  @Delete('admin/companies/:companyId/catalog/apartments/:apartmentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete draft apartment (admin)' })
  @ApiNoContentResponse({ description: 'Deleted' })
  async remove(@Param() params: AdminCatalogApartmentParamDto): Promise<void> {
    const companyId = await this.builderCompanies.requireBuilderCompanyId(params.companyId);
    await this.apartmentsService.remove(companyId, params.apartmentId);
  }
}
