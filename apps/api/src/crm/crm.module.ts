import { Module } from "@nestjs/common";

import { CompanyMemberGuard } from "../company/guards/company-member.guard.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import {
  BuyerRequestsController,
  RequestsController,
} from "./buyer/buyer-requests.controller.js";
import { BuyerRequestsService } from "./buyer/buyer-requests.service.js";
import { RequestIntakeService } from "./intake/request-intake.service.js";
import { PortalCrmDealsController } from "./portal/portal-crm-deals.controller.js";
import { PortalCrmDealsService } from "./portal/portal-crm-deals.service.js";
import { PortalCrmNotesActivitiesService } from "./portal/portal-crm-notes-activities.service.js";
import { DealStatusService } from "./status/deal-status.service.js";

@Module({
  imports: [PrismaModule],
  controllers: [
    RequestsController,
    BuyerRequestsController,
    PortalCrmDealsController,
  ],
  providers: [
    RequestIntakeService,
    BuyerRequestsService,
    PortalCrmDealsService,
    PortalCrmNotesActivitiesService,
    DealStatusService,
    CompanyMemberGuard,
  ],
  exports: [RequestIntakeService],
})
export class CrmModule {}
