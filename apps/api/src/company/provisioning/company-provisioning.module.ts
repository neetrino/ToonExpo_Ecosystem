import { Module } from "@nestjs/common";

import { AccessTokensModule } from "../../access-tokens/access-tokens.module.js";
import { CompanyProvisioningService } from "./company-provisioning.service.js";

@Module({
  imports: [AccessTokensModule],
  providers: [CompanyProvisioningService],
  exports: [CompanyProvisioningService],
})
export class CompanyProvisioningModule {}
