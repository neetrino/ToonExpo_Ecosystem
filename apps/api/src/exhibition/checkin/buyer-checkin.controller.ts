import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { BuyerCheckInStatusResponse } from "@toonexpo/contracts";

import { AccountTypes } from "../../auth/decorators/account-types.decorator.js";
import { CurrentUser } from "../../auth/decorators/current-user.decorator.js";
import type { AuthenticatedUser } from "../../auth/types/authenticated-user.js";
import { BuyerCheckInService } from "./buyer-checkin.service.js";

@ApiTags("buyer-checkin")
@AccountTypes("buyer")
@Controller("buyer/checkin")
export class BuyerCheckInController {
  constructor(private readonly buyerCheckIn: BuyerCheckInService) {}

  @Get()
  @ApiOperation({
    summary: "Check-in status for the active event and past events",
  })
  @ApiOkResponse({ description: "Buyer check-in status (no staff identity)" })
  getMine(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<BuyerCheckInStatusResponse> {
    return this.buyerCheckIn.getStatus(user.id);
  }
}
