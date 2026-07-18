import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module.js";
import { ApartmentsService } from "./apartments.service.js";
import { BuildingsCatalogService } from "./buildings-catalog.service.js";
import { BuildersService } from "./builders.service.js";
import { CatalogController } from "./catalog.controller.js";
import { FloorsCatalogService } from "./floors-catalog.service.js";
import { ProjectsService } from "./projects.service.js";

@Module({
  imports: [PrismaModule],
  controllers: [CatalogController],
  providers: [
    ProjectsService,
    ApartmentsService,
    BuildersService,
    BuildingsCatalogService,
    FloorsCatalogService,
  ],
})
export class CatalogModule {}
