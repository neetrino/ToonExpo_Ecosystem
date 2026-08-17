import { Module } from "@nestjs/common";

import { CompanyMemberGuard } from "../company/guards/company-member.guard.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { AdminProjectBankPartnerOffersController } from "./admin/admin-project-offers.controller.js";
import { AdminBankPartnerOfferTemplatesController } from "./admin/admin-templates.controller.js";
import { AdminBankPartnerOfferTemplatesService } from "./admin/admin-templates.service.js";
import {
  PortalBankPartnerOfferTemplatesController,
  PortalProjectBankPartnerOffersController,
} from "./portal/portal-project-offers.controller.js";
import { ProjectBankPartnerOffersService } from "./project-offers.service.js";

@Module({
  imports: [PrismaModule],
  controllers: [
    AdminBankPartnerOfferTemplatesController,
    AdminProjectBankPartnerOffersController,
    PortalBankPartnerOfferTemplatesController,
    PortalProjectBankPartnerOffersController,
  ],
  providers: [
    AdminBankPartnerOfferTemplatesService,
    ProjectBankPartnerOffersService,
    CompanyMemberGuard,
  ],
})
export class BankPartnerOffersModule {}
