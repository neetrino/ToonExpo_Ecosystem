import { Module } from "@nestjs/common";

import { CompanyProvisioningModule } from "../company/provisioning/company-provisioning.module.js";
import { AdminBosProvisioningController } from "./admin/admin-bos-provisioning.controller.js";
import { AdminBosProvisioningService } from "./admin/admin-bos-provisioning.service.js";
import { BosApiKeyGuard } from "./guards/bos-api-key.guard.js";
import { BosProvisioningAuditService } from "./bos/bos-provisioning-audit.service.js";
import { BosProvisioningController } from "./bos/bos-provisioning.controller.js";
import { BosProvisioningService } from "./bos/bos-provisioning.service.js";

@Module({
  imports: [CompanyProvisioningModule],
  controllers: [BosProvisioningController, AdminBosProvisioningController],
  providers: [
    BosApiKeyGuard,
    BosProvisioningAuditService,
    BosProvisioningService,
    AdminBosProvisioningService,
  ],
})
export class IntegrationsModule {}
