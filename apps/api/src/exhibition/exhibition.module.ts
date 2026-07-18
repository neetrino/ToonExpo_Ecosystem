import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module.js";
import { QrModule } from "../qr/qr.module.js";
import { AdminBoothsController } from "./admin/admin-booths.controller.js";
import { AdminBoothsService } from "./admin/admin-booths.service.js";
import { AdminEventsController } from "./admin/admin-events.controller.js";
import { AdminEventsService } from "./admin/admin-events.service.js";
import { AdminRouteGraphService } from "./admin/admin-route-graph.service.js";
import { AdminVenueMapsController } from "./admin/admin-venue-maps.controller.js";
import { AdminVenueMapsService } from "./admin/admin-venue-maps.service.js";
import { CheckInController } from "./checkin/checkin.controller.js";
import { CheckInScanService } from "./checkin/checkin-scan.service.js";
import { CheckInService } from "./checkin/checkin.service.js";
import { PublicBoothSearchService } from "./public/public-booth-search.service.js";
import { PublicExhibitionController } from "./public/public-exhibition.controller.js";
import { PublicExhibitionService } from "./public/public-exhibition.service.js";
import { PublicRouteService } from "./public/public-route.service.js";

@Module({
  imports: [PrismaModule, QrModule],
  controllers: [
    AdminEventsController,
    AdminVenueMapsController,
    AdminBoothsController,
    CheckInController,
    PublicExhibitionController,
  ],
  providers: [
    AdminEventsService,
    AdminVenueMapsService,
    AdminRouteGraphService,
    AdminBoothsService,
    CheckInScanService,
    CheckInService,
    PublicExhibitionService,
    PublicBoothSearchService,
    PublicRouteService,
  ],
})
export class ExhibitionModule {}
