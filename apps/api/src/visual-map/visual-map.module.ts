import { Module } from "@nestjs/common";

import { CompanyMemberGuard } from "../company/guards/company-member.guard.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { PortalVisualMapCanvasService } from "./portal/portal-visual-map-canvas.service.js";
import { PortalVisualMapController } from "./portal/portal-visual-map.controller.js";
import { PortalVisualMapHotspotService } from "./portal/portal-visual-map-hotspot.service.js";
import { PortalVisualMapService } from "./portal/portal-visual-map.service.js";
import { PublicVisualMapController } from "./public/public-visual-map.controller.js";
import { PublicVisualMapService } from "./public/public-visual-map.service.js";

@Module({
  imports: [PrismaModule],
  controllers: [PortalVisualMapController, PublicVisualMapController],
  providers: [
    PortalVisualMapCanvasService,
    PortalVisualMapHotspotService,
    PortalVisualMapService,
    PublicVisualMapService,
    CompanyMemberGuard,
  ],
})
export class VisualMapModule {}
