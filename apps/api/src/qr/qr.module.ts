import { Module } from "@nestjs/common";

import { BuyerQrController } from "./buyer-qr.controller.js";
import { QrCodesService } from "./qr-codes.service.js";
import { QrResolveController } from "./qr-resolve.controller.js";
import { QrResolveService } from "./qr-resolve.service.js";

@Module({
  controllers: [BuyerQrController, QrResolveController],
  providers: [QrCodesService, QrResolveService],
  exports: [QrCodesService],
})
export class QrModule {}
