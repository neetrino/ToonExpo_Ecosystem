import { Module } from "@nestjs/common";

import { CompanyMemberGuard } from "../company/guards/company-member.guard.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { PortalVisualMapController } from "./portal/portal-visual-map.controller.js";
import { PortalVisualMapService } from "./portal/portal-visual-map.service.js";

@Module({
  imports: [PrismaModule],
  controllers: [PortalVisualMapController],
  providers: [PortalVisualMapService, CompanyMemberGuard],
})
export class VisualMapModule {}
