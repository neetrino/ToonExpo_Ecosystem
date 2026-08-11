import { Module } from '@nestjs/common';

import { AccessTokensModule } from '../../access-tokens/access-tokens.module.js';
import { CompanyProvisioningModule } from '../../company/provisioning/company-provisioning.module.js';
import { ReadinessModule } from '../../readiness/readiness.module.js';
import { AdminCompaniesController } from './admin-companies.controller.js';
import { AdminCompaniesService } from './admin-companies.service.js';
import { AdminHomeFeaturedService } from './admin-home-featured.service.js';
import { AdminInventoryController } from './admin-inventory.controller.js';
import { AdminInventoryService } from './admin-inventory.service.js';
import { AdminProjectsController } from './admin-projects.controller.js';

@Module({
  imports: [AccessTokensModule, CompanyProvisioningModule, ReadinessModule],
  controllers: [AdminCompaniesController, AdminProjectsController, AdminInventoryController],
  providers: [AdminCompaniesService, AdminInventoryService, AdminHomeFeaturedService],
})
export class AdminCompaniesModule {}
