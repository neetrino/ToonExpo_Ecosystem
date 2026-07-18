import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module.js";
import { AdminPartnerOffersService } from "./admin/admin-partner-offers.service.js";
import { AdminPartnersController } from "./admin/admin-partners.controller.js";
import { AdminPartnersService } from "./admin/admin-partners.service.js";

@Module({
  imports: [PrismaModule],
  controllers: [AdminPartnersController],
  providers: [AdminPartnersService, AdminPartnerOffersService],
})
export class PartnersModule {}
