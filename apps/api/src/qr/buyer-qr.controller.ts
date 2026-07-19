import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import type {
  BuyerQrResponse,
  BuyerQrScanHistoryResponse,
} from "@toonexpo/contracts";

import { AccountTypes } from "../auth/decorators/account-types.decorator.js";
import { CurrentUser } from "../auth/decorators/current-user.decorator.js";
import type { AuthenticatedUser } from "../auth/types/authenticated-user.js";
import { QrCodesService } from "./qr-codes.service.js";

@ApiTags("buyer-qr")
@AccountTypes("buyer")
@Controller("buyer/qr")
export class BuyerQrController {
  constructor(private readonly qrCodes: QrCodesService) {}

  @Get()
  @ApiOperation({ summary: "Get permanent buyer QR payload for display" })
  @ApiOkResponse({ description: "QR payload URL (frontend renders image)" })
  getMine(@CurrentUser() user: AuthenticatedUser): Promise<BuyerQrResponse> {
    return this.qrCodes.getBuyerQr(user.id);
  }

  @Get("scans")
  @ApiOperation({
    summary: "List scan history for the buyer's QR (company name, not employee)",
  })
  @ApiOkResponse({ description: "Buyer-facing scan history" })
  listScans(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<BuyerQrScanHistoryResponse> {
    return this.qrCodes.listBuyerScans(user.id);
  }
}
