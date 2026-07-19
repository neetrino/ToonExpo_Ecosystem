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
import type { PartnerOfferItem, PortalPartnerDetail } from "@toonexpo/contracts";

import { AccountTypes } from "../../auth/decorators/account-types.decorator.js";
import { CurrentUser } from "../../auth/decorators/current-user.decorator.js";
import type { AuthenticatedUser } from "../../auth/types/authenticated-user.js";
import { CompanyMember } from "../../company/decorators/company-member.decorator.js";
import { CurrentCompanyMember } from "../../company/decorators/current-company-member.decorator.js";
import { CompanyMemberGuard } from "../../company/guards/company-member.guard.js";
import type { CompanyMemberContext } from "../../company/types/company-member-context.js";
import {
  CreatePartnerOfferDto,
  UpdatePartnerOfferDto,
} from "../admin/dto/admin-partner-offer.dto.js";
import { UpdatePortalPartnerDto } from "./dto/portal-partner.dto.js";
import { PortalPartnerService } from "./portal-partner.service.js";

@ApiTags("portal-partner")
@AccountTypes("company_member")
@CompanyMember()
@UseGuards(CompanyMemberGuard)
@Controller("portal/partner")
export class PortalPartnerController {
  constructor(private readonly partner: PortalPartnerService) {}

  @Get()
  @ApiOperation({ summary: "Get own partner profile with offers" })
  @ApiOkResponse({ description: "Partner portal profile" })
  get(
    @CurrentCompanyMember() member: CompanyMemberContext,
  ): Promise<PortalPartnerDetail> {
    return this.partner.getOwnProfile(member);
  }

  @Patch()
  @ApiOperation({ summary: "Update own partner content fields" })
  @ApiOkResponse({ description: "Updated partner profile" })
  update(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdatePortalPartnerDto,
  ): Promise<PortalPartnerDetail> {
    return this.partner.updateOwnProfile(member, user.id, body);
  }

  @Post("offers")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create own partner offer" })
  @ApiCreatedResponse({ description: "Created offer" })
  createOffer(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreatePartnerOfferDto,
  ): Promise<PartnerOfferItem> {
    return this.partner.createOffer(member, user.id, body);
  }

  @Patch("offers/:offerId")
  @ApiOperation({ summary: "Update own partner offer" })
  @ApiOkResponse({ description: "Updated offer" })
  updateOffer(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param("offerId") offerId: string,
    @Body() body: UpdatePartnerOfferDto,
  ): Promise<PartnerOfferItem> {
    return this.partner.updateOffer(member, offerId, user.id, body);
  }

  @Delete("offers/:offerId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete own partner offer" })
  @ApiNoContentResponse({ description: "Deleted" })
  async removeOffer(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @Param("offerId") offerId: string,
  ): Promise<void> {
    await this.partner.removeOffer(member, offerId);
  }
}
