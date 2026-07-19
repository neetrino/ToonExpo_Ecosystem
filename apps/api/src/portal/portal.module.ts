import { Module } from '@nestjs/common';

import { CompanyMemberGuard } from '../company/guards/company-member.guard.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { PortalApartmentsController } from './apartments/portal-apartments.controller.js';
import { PortalApartmentsService } from './apartments/portal-apartments.service.js';
import { PortalBuildingsController } from './buildings/portal-buildings.controller.js';
import { PortalBuildingsService } from './buildings/portal-buildings.service.js';
import { PortalFloorsController } from './floors/portal-floors.controller.js';
import { PortalFloorsService } from './floors/portal-floors.service.js';
import { PortalProjectQrService } from './projects/portal-project-qr.service.js';
import { PortalProjectsController } from './projects/portal-projects.controller.js';
import { PortalProjectsService } from './projects/portal-projects.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [
    PortalProjectsController,
    PortalBuildingsController,
    PortalFloorsController,
    PortalApartmentsController,
  ],
  providers: [
    PortalProjectsService,
    PortalProjectQrService,
    PortalBuildingsService,
    PortalFloorsService,
    PortalApartmentsService,
    CompanyMemberGuard,
  ],
  exports: [
    PortalProjectsService,
    PortalProjectQrService,
    PortalBuildingsService,
    PortalFloorsService,
    PortalApartmentsService,
  ],
})
export class PortalModule {}
