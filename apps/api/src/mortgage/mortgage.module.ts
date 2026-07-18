import { Module } from "@nestjs/common";

import { CompanyMemberGuard } from "../company/guards/company-member.guard.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { AdminBankOffersController } from "./admin/admin-bank-offers.controller.js";
import { AdminBankOffersService } from "./admin/admin-bank-offers.service.js";
import { PortalBankOffersController } from "./portal/portal-bank-offers.controller.js";
import { PortalBankOffersService } from "./portal/portal-bank-offers.service.js";
import { PublicMortgageController } from "./public/public-mortgage.controller.js";
import { PublicMortgageService } from "./public/public-mortgage.service.js";

@Module({
  imports: [PrismaModule],
  controllers: [
    AdminBankOffersController,
    PortalBankOffersController,
    PublicMortgageController,
  ],
  providers: [
    AdminBankOffersService,
    PortalBankOffersService,
    PublicMortgageService,
    CompanyMemberGuard,
  ],
})
export class MortgageModule {}
