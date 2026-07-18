import { Module } from "@nestjs/common";

import { CompanyMemberGuard } from "../company/guards/company-member.guard.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { AdminPartnerOffersService } from "./admin/admin-partner-offers.service.js";
import { AdminPartnersController } from "./admin/admin-partners.controller.js";
import { AdminPartnersService } from "./admin/admin-partners.service.js";
import { PortalPartnerController } from "./portal/portal-partner.controller.js";
import { PortalPartnerService } from "./portal/portal-partner.service.js";
import { PublicPartnersController } from "./public/public-partners.controller.js";
import { PublicPartnersService } from "./public/public-partners.service.js";

@Module({
  imports: [PrismaModule],
  controllers: [
    AdminPartnersController,
    PortalPartnerController,
    PublicPartnersController,
  ],
  providers: [
    AdminPartnersService,
    AdminPartnerOffersService,
    PortalPartnerService,
    PublicPartnersService,
    CompanyMemberGuard,
  ],
})
export class PartnersModule {}
