import { Global, Module } from "@nestjs/common";

import { CompanyMemberGuard } from "../company/guards/company-member.guard.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { AdminAnalyticsController } from "./admin/admin-analytics.controller.js";
import { AdminAnalyticsService } from "./admin/admin-analytics.service.js";
import { AnalyticsService } from "./analytics.service.js";
import { PortalAnalyticsController } from "./portal/portal-analytics.controller.js";
import { PortalAnalyticsService } from "./portal/portal-analytics.service.js";

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [AdminAnalyticsController, PortalAnalyticsController],
  providers: [
    AnalyticsService,
    AdminAnalyticsService,
    PortalAnalyticsService,
    CompanyMemberGuard,
  ],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
