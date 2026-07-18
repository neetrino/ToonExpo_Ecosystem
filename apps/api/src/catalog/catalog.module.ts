import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module.js";
import { ApartmentsService } from "./apartments.service.js";
import { BuildersService } from "./builders.service.js";
import { CatalogController } from "./catalog.controller.js";
import { ProjectsService } from "./projects.service.js";

@Module({
  imports: [PrismaModule],
  controllers: [CatalogController],
  providers: [ProjectsService, ApartmentsService, BuildersService],
})
export class CatalogModule {}
