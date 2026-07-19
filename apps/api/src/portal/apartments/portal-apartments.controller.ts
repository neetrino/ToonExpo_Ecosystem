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
import type { PortalApartmentDetail } from '@toonexpo/contracts';

import { AccountTypes } from '../../auth/decorators/account-types.decorator.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.js';
import { CompanyMember } from '../../company/decorators/company-member.decorator.js';
import { CurrentCompanyMember } from '../../company/decorators/current-company-member.decorator.js';
import { CompanyMemberGuard } from '../../company/guards/company-member.guard.js';
import type { CompanyMemberContext } from '../../company/types/company-member-context.js';
import { assertCompanyAdmin } from '../utils/access.js';
import {
  BulkCreatePortalApartmentsDto,
  CreatePortalApartmentDto,
  UpdatePortalApartmentDto,
} from '../dto/portal-apartment.dto.js';
import { UpdatePortalPublicationDto } from '../dto/update-portal-publication.dto.js';
import { PortalApartmentsService } from './portal-apartments.service.js';

@ApiTags('portal-apartments')
@AccountTypes('company_member')
@CompanyMember({ builderOnly: true })
@UseGuards(CompanyMemberGuard)
@Controller()
export class PortalApartmentsController {
  constructor(private readonly apartmentsService: PortalApartmentsService) {}

  @Get('portal/floors/:floorId/apartments')
  @ApiOperation({ summary: 'List apartments on a floor' })
  @ApiOkResponse({ description: 'Apartments' })
  list(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @Param('floorId') floorId: string,
  ): Promise<PortalApartmentDetail[]> {
    return this.apartmentsService.listByFloor(member.companyId, floorId);
  }

  @Post('portal/floors/:floorId/apartments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an apartment on a floor' })
  @ApiCreatedResponse({ description: 'Created apartment' })
  create(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('floorId') floorId: string,
    @Body() body: CreatePortalApartmentDto,
  ): Promise<PortalApartmentDetail> {
    return this.apartmentsService.create(member.companyId, user.id, floorId, body);
  }

  @Post('portal/floors/:floorId/apartments/bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Bulk-create apartments on a floor' })
  @ApiCreatedResponse({ description: 'Created apartments' })
  createBulk(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('floorId') floorId: string,
    @Body() body: BulkCreatePortalApartmentsDto,
  ): Promise<PortalApartmentDetail[]> {
    return this.apartmentsService.createBulk(member.companyId, user.id, floorId, body);
  }

  @Get('portal/apartments/:apartmentId')
  @ApiOperation({ summary: 'Get apartment detail' })
  @ApiOkResponse({ description: 'Apartment detail' })
  getById(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @Param('apartmentId') apartmentId: string,
  ): Promise<PortalApartmentDetail> {
    return this.apartmentsService.getById(member.companyId, apartmentId);
  }

  @Patch('portal/apartments/:apartmentId')
  @ApiOperation({
    summary: 'Update apartment (incl. salesStatus + history)',
  })
  @ApiOkResponse({ description: 'Updated apartment' })
  update(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('apartmentId') apartmentId: string,
    @Body() body: UpdatePortalApartmentDto,
  ): Promise<PortalApartmentDetail> {
    return this.apartmentsService.update(member.companyId, user.id, apartmentId, body);
  }

  @Patch('portal/apartments/:apartmentId/publication')
  @ApiOperation({ summary: 'Change apartment publication (company_admin)' })
  @ApiOkResponse({ description: 'Updated publication status' })
  updatePublication(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('apartmentId') apartmentId: string,
    @Body() body: UpdatePortalPublicationDto,
  ): Promise<PortalApartmentDetail> {
    assertCompanyAdmin(member);
    return this.apartmentsService.updatePublication(member.companyId, user.id, apartmentId, body);
  }

  @Delete('portal/apartments/:apartmentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete draft apartment (company_admin)' })
  @ApiNoContentResponse({ description: 'Deleted' })
  async remove(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @Param('apartmentId') apartmentId: string,
  ): Promise<void> {
    assertCompanyAdmin(member);
    await this.apartmentsService.remove(member.companyId, apartmentId);
  }
}
