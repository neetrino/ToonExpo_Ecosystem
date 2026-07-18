import { Module } from "@nestjs/common";

import { CompanyProvisioningModule } from "../company/provisioning/company-provisioning.module.js";
import { BosApiKeyGuard } from "./guards/bos-api-key.guard.js";
import { BosProvisioningAuditService } from "./bos/bos-provisioning-audit.service.js";
import { BosProvisioningController } from "./bos/bos-provisioning.controller.js";
import { BosProvisioningService } from "./bos/bos-provisioning.service.js";

@Module({
  imports: [CompanyProvisioningModule],
  controllers: [BosProvisioningController],
  providers: [
    BosApiKeyGuard,
    BosProvisioningAuditService,
    BosProvisioningService,
  ],
})
export class IntegrationsModule {}
