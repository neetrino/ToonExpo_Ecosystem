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
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type { BankOfferListItem, BankOfferListResponse } from "@toonexpo/contracts";

import { AccountTypes } from "../../auth/decorators/account-types.decorator.js";
import { CurrentUser } from "../../auth/decorators/current-user.decorator.js";
import type { AuthenticatedUser } from "../../auth/types/authenticated-user.js";
import { CompanyMember } from "../../company/decorators/company-member.decorator.js";
import { CurrentCompanyMember } from "../../company/decorators/current-company-member.decorator.js";
import { CompanyMemberGuard } from "../../company/guards/company-member.guard.js";
import type { CompanyMemberContext } from "../../company/types/company-member-context.js";
import {
  PortalCreateBankOfferDto,
  PortalUpdateBankOfferDto,
} from "./dto/portal-bank-offer.dto.js";
import { PortalBankOffersService } from "./portal-bank-offers.service.js";

@ApiTags("portal-bank-offers")
@AccountTypes("company_member")
@CompanyMember()
@UseGuards(CompanyMemberGuard)
@Controller("portal/bank-offers")
export class PortalBankOffersController {
  constructor(private readonly offers: PortalBankOffersService) {}

  @Get()
  @ApiOperation({ summary: "List own bank offers" })
  @ApiOkResponse({ description: "Own bank offers" })
  list(
    @CurrentCompanyMember() member: CompanyMemberContext,
  ): Promise<BankOfferListResponse> {
    return this.offers.list(member);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create own bank offer draft" })
  @ApiCreatedResponse({ description: "Created bank offer draft" })
  create(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: PortalCreateBankOfferDto,
  ): Promise<BankOfferListItem> {
    return this.offers.create(member, user.id, body);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update own bank offer" })
  @ApiOkResponse({ description: "Updated bank offer" })
  update(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() body: PortalUpdateBankOfferDto,
  ): Promise<BankOfferListItem> {
    return this.offers.update(member, id, user.id, body);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete own bank offer" })
  @ApiNoContentResponse({ description: "Deleted" })
  async remove(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @Param("id") id: string,
  ): Promise<void> {
    await this.offers.remove(member, id);
  }
}
