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
import type { BankOfferListItem, BankOfferListResponse } from "@toonexpo/contracts";

import { AccountTypes } from "../../auth/decorators/account-types.decorator.js";
import { CurrentUser } from "../../auth/decorators/current-user.decorator.js";
import type { AuthenticatedUser } from "../../auth/types/authenticated-user.js";
import { AdminBankOffersService } from "./admin-bank-offers.service.js";
import {
  CreateBankOfferDto,
  ListAdminBankOffersQueryDto,
  UpdateBankOfferDto,
} from "./dto/admin-bank-offer.dto.js";

@ApiTags("admin-bank-offers")
@AccountTypes("platform_admin")
@Controller("admin/bank-offers")
export class AdminBankOffersController {
  constructor(private readonly offers: AdminBankOffersService) {}

  @Get()
  @ApiOperation({ summary: "List bank offers" })
  @ApiOkResponse({ description: "Bank offer list" })
  list(@Query() query: ListAdminBankOffersQueryDto): Promise<BankOfferListResponse> {
    return this.offers.list(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create bank offer for a bank partner" })
  @ApiCreatedResponse({ description: "Created bank offer" })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateBankOfferDto,
  ): Promise<BankOfferListItem> {
    return this.offers.create(user.id, body);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get bank offer by id" })
  @ApiOkResponse({ description: "Bank offer detail" })
  getById(@Param("id") id: string): Promise<BankOfferListItem> {
    return this.offers.getById(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update bank offer" })
  @ApiOkResponse({ description: "Updated bank offer" })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() body: UpdateBankOfferDto,
  ): Promise<BankOfferListItem> {
    return this.offers.update(id, user.id, body);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete bank offer" })
  @ApiNoContentResponse({ description: "Deleted" })
  async remove(@Param("id") id: string): Promise<void> {
    await this.offers.remove(id);
  }
}
