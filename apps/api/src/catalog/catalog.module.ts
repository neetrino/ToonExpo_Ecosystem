import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module.js";
import { ApartmentsService } from "./apartments.service.js";
import { BuildingsCatalogService } from "./buildings-catalog.service.js";
import { BuildersService } from "./builders.service.js";
import { CatalogController } from "./catalog.controller.js";
import { CatalogPricesController } from "./catalog-prices.controller.js";
import { CatalogPricesService } from "./catalog-prices.service.js";
import { FloorsCatalogService } from "./floors-catalog.service.js";
import { ProjectsService } from "./projects.service.js";

@Module({
  imports: [PrismaModule],
  controllers: [CatalogController, CatalogPricesController],
  providers: [
    ProjectsService,
    ApartmentsService,
    BuildersService,
    BuildingsCatalogService,
    FloorsCatalogService,
    CatalogPricesService,
  ],
})
export class CatalogModule {}
