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
} from "@nestjs/common";
import {
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type {
  ApplyProjectBankPartnerOffersResponse,
  BankPartnerOfferTemplateListResponse,
  ProjectBankPartnerOfferItem,
  ProjectBankPartnerOfferListResponse,
} from "@toonexpo/contracts";

import { AccountTypes } from "../../auth/decorators/account-types.decorator.js";
import { CurrentUser } from "../../auth/decorators/current-user.decorator.js";
import type { AuthenticatedUser } from "../../auth/types/authenticated-user.js";
import { CompanyMember } from "../../company/decorators/company-member.decorator.js";
import { CurrentCompanyMember } from "../../company/decorators/current-company-member.decorator.js";
import { CompanyMemberGuard } from "../../company/guards/company-member.guard.js";
import type { CompanyMemberContext } from "../../company/types/company-member-context.js";
import { requireOwnedProject } from "../../portal/utils/ownership.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { AdminBankPartnerOfferTemplatesService } from "../admin/admin-templates.service.js";
import {
  ApplyProjectBankPartnerOffersDto,
  UpdateProjectBankPartnerOfferDto,
} from "../admin/dto/project-offer.dto.js";
import { ProjectBankPartnerOffersService } from "../project-offers.service.js";

@ApiTags("portal-bank-partner-offer-templates")
@AccountTypes("company_member")
@CompanyMember({ builderOnly: true })
@UseGuards(CompanyMemberGuard)
@Controller("portal/bank-partner-offer-templates")
export class PortalBankPartnerOfferTemplatesController {
  constructor(
    private readonly templates: AdminBankPartnerOfferTemplatesService,
  ) {}

  @Get()
  @ApiOperation({ summary: "List published bank partner offer templates" })
  @ApiOkResponse({ description: "Published template list" })
  list(): Promise<BankPartnerOfferTemplateListResponse> {
    return this.templates.list({ publishedOnly: true });
  }
}

@ApiTags("portal-project-bank-partner-offers")
@AccountTypes("company_member")
@CompanyMember({ builderOnly: true })
@UseGuards(CompanyMemberGuard)
@Controller("portal/projects/:projectId/bank-partner-offers")
export class PortalProjectBankPartnerOffersController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly offers: ProjectBankPartnerOffersService,
  ) {}

  @Get()
  @ApiOperation({ summary: "List bank partner offers on own project" })
  @ApiOkResponse({ description: "Project offer list" })
  async list(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @Param("projectId") projectId: string,
  ): Promise<ProjectBankPartnerOfferListResponse> {
    await requireOwnedProject(this.prisma, projectId, member.companyId);
    return this.offers.listForProject(projectId);
  }

  @Post("apply")
  @ApiOperation({ summary: "Apply published templates to own project" })
  @ApiOkResponse({ description: "Applied offers" })
  async apply(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Body() body: ApplyProjectBankPartnerOffersDto,
  ): Promise<ApplyProjectBankPartnerOffersResponse> {
    await requireOwnedProject(this.prisma, projectId, member.companyId);
    return this.offers.apply(projectId, user.id, body);
  }

  @Patch(":offerId")
  @ApiOperation({ summary: "Update a project bank partner offer" })
  @ApiOkResponse({ description: "Updated offer" })
  async update(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Param("offerId") offerId: string,
    @Body() body: UpdateProjectBankPartnerOfferDto,
  ): Promise<ProjectBankPartnerOfferItem> {
    await requireOwnedProject(this.prisma, projectId, member.companyId);
    return this.offers.update(projectId, offerId, user.id, body);
  }

  @Delete(":offerId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove a bank partner offer from own project" })
  @ApiNoContentResponse({ description: "Deleted" })
  async remove(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @Param("projectId") projectId: string,
    @Param("offerId") offerId: string,
  ): Promise<void> {
    await requireOwnedProject(this.prisma, projectId, member.companyId);
    await this.offers.remove(projectId, offerId);
  }
}
