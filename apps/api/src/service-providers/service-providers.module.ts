import { Module } from "@nestjs/common";

import { CompanyMemberGuard } from "../company/guards/company-member.guard.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { AdminServiceProviderCategoriesController } from "./admin/admin-service-provider-categories.controller.js";
import { AdminServiceProviderCategoriesService } from "./admin/admin-service-provider-categories.service.js";
import { AdminServiceProvidersController } from "./admin/admin-service-providers.controller.js";
import { AdminServiceProvidersService } from "./admin/admin-service-providers.service.js";
import { PortalServiceProvidersController } from "./portal/portal-service-providers.controller.js";
import { PortalServiceProvidersService } from "./portal/portal-service-providers.service.js";

@Module({
  imports: [PrismaModule],
  controllers: [
    AdminServiceProviderCategoriesController,
    AdminServiceProvidersController,
    PortalServiceProvidersController,
  ],
  providers: [
    AdminServiceProviderCategoriesService,
    AdminServiceProvidersService,
    PortalServiceProvidersService,
    CompanyMemberGuard,
  ],
})
export class ServiceProvidersModule {}
