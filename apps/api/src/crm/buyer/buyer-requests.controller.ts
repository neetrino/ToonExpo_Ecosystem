import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type {
  BuyerRequestListResponse,
  IntakeCreateResult,
} from "@toonexpo/contracts";

import { AccountTypes } from "../../auth/decorators/account-types.decorator.js";
import { CurrentUser } from "../../auth/decorators/current-user.decorator.js";
import type { AuthenticatedUser } from "../../auth/types/authenticated-user.js";
import { BuyerRequestsService } from "../buyer/buyer-requests.service.js";
import { CreateBuyerRequestDto } from "../dto/create-buyer-request.dto.js";
import { ListBuyerRequestsQueryDto } from "../dto/crm-deal-query.dto.js";

@ApiTags("requests")
@AccountTypes("buyer")
@Controller("requests")
export class RequestsController {
  constructor(private readonly buyerRequests: BuyerRequestsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create buyer project request (unified intake → CRM deal)",
  })
  @ApiCreatedResponse({ description: "Request + deal created or deduplicated" })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateBuyerRequestDto,
  ): Promise<IntakeCreateResult> {
    return this.buyerRequests.createFromBuyer(user.id, body);
  }
}

@ApiTags("buyer-requests")
@AccountTypes("buyer")
@Controller("buyer/requests")
export class BuyerRequestsController {
  constructor(private readonly buyerRequests: BuyerRequestsService) {}

  @Get()
  @ApiOperation({
    summary: "List my requests with buyer-facing deal status (no CRM notes)",
  })
  @ApiOkResponse({ description: "Buyer request history" })
  listMine(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListBuyerRequestsQueryDto,
  ): Promise<BuyerRequestListResponse> {
    return this.buyerRequests.listMine(user.id, query.page, query.pageSize);
  }
}
