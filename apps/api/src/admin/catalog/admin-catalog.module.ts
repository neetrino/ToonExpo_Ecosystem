import { Module } from '@nestjs/common';

import { CompanyMembersModule } from '../../company/company-members.module.js';
import { MediaModule } from '../../media/media.module.js';
import { PortalModule } from '../../portal/portal.module.js';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { VisualMapModule } from '../../visual-map/visual-map.module.js';
import { AdminBuilderCompanyService } from './admin-builder-company.service.js';
import { AdminCatalogApartmentsController } from './admin-catalog-apartments.controller.js';
import { AdminCatalogBuildingsController } from './admin-catalog-buildings.controller.js';
import { AdminCatalogFloorsController } from './admin-catalog-floors.controller.js';
import { AdminCatalogMediaController } from './admin-catalog-media.controller.js';
import { AdminCatalogProjectsController } from './admin-catalog-projects.controller.js';
import { AdminCatalogVisualMapController } from './admin-catalog-visual-map.controller.js';
import { AdminCompanyProfileController } from './admin-company-profile.controller.js';

@Module({
  imports: [PrismaModule, PortalModule, VisualMapModule, MediaModule, CompanyMembersModule],
  controllers: [
    AdminCatalogProjectsController,
    AdminCatalogBuildingsController,
    AdminCatalogFloorsController,
    AdminCatalogApartmentsController,
    AdminCatalogVisualMapController,
    AdminCatalogMediaController,
    AdminCompanyProfileController,
  ],
  providers: [AdminBuilderCompanyService],
})
export class AdminCatalogModule {}
