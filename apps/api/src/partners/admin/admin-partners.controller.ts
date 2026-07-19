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
  Query,
} from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type {
  AdminPartnerDetail,
  AdminPartnerListResponse,
  PartnerOfferItem,
} from "@toonexpo/contracts";

import { AccountTypes } from "../../auth/decorators/account-types.decorator.js";
import { CurrentUser } from "../../auth/decorators/current-user.decorator.js";
import type { AuthenticatedUser } from "../../auth/types/authenticated-user.js";
import { AdminPartnerOffersService } from "./admin-partner-offers.service.js";
import { AdminPartnersService } from "./admin-partners.service.js";
import {
  CreatePartnerOfferDto,
  UpdatePartnerOfferDto,
} from "./dto/admin-partner-offer.dto.js";
import {
  CreateAdminPartnerDto,
  ListAdminPartnersQueryDto,
  UpdateAdminPartnerDto,
} from "./dto/admin-partner.dto.js";

@ApiTags("admin-partners")
@AccountTypes("platform_admin")
@Controller("admin/partners")
export class AdminPartnersController {
  constructor(
    private readonly partners: AdminPartnersService,
    private readonly offers: AdminPartnerOffersService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create partner profile for an existing company" })
  @ApiCreatedResponse({ description: "Created partner profile" })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateAdminPartnerDto,
  ): Promise<AdminPartnerDetail> {
    return this.partners.create(user.id, body);
  }

  @Get()
  @ApiOperation({ summary: "List partner profiles (paginated)" })
  @ApiOkResponse({ description: "Paginated partner list" })
  list(
    @Query() query: ListAdminPartnersQueryDto,
  ): Promise<AdminPartnerListResponse> {
    return this.partners.list(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get partner profile detail with offers" })
  @ApiOkResponse({ description: "Partner detail" })
  getById(@Param("id") id: string): Promise<AdminPartnerDetail> {
    return this.partners.getById(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update partner profile fields and publication state" })
  @ApiOkResponse({ description: "Updated partner" })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() body: UpdateAdminPartnerDto,
  ): Promise<AdminPartnerDetail> {
    return this.partners.update(id, user.id, body);
  }

  @Post(":id/offers")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create partner offer" })
  @ApiCreatedResponse({ description: "Created offer" })
  createOffer(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() body: CreatePartnerOfferDto,
  ): Promise<PartnerOfferItem> {
    return this.offers.create(id, user.id, body);
  }

  @Patch(":id/offers/:offerId")
  @ApiOperation({ summary: "Update partner offer" })
  @ApiOkResponse({ description: "Updated offer" })
  updateOffer(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Param("offerId") offerId: string,
    @Body() body: UpdatePartnerOfferDto,
  ): Promise<PartnerOfferItem> {
    return this.offers.update(id, offerId, user.id, body);
  }

  @Delete(":id/offers/:offerId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete partner offer" })
  @ApiNoContentResponse({ description: "Deleted" })
  async removeOffer(
    @Param("id") id: string,
    @Param("offerId") offerId: string,
  ): Promise<void> {
    await this.offers.remove(id, offerId);
  }
}
