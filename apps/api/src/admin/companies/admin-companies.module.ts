import { Module } from '@nestjs/common';

import { AccessTokensModule } from '../../access-tokens/access-tokens.module.js';
import { CompanyProvisioningModule } from '../../company/provisioning/company-provisioning.module.js';
import { AdminCompaniesController } from './admin-companies.controller.js';
import { AdminCompaniesService } from './admin-companies.service.js';
import { AdminInventoryController } from './admin-inventory.controller.js';
import { AdminInventoryService } from './admin-inventory.service.js';
import { AdminProjectsController } from './admin-projects.controller.js';

@Module({
  imports: [AccessTokensModule, CompanyProvisioningModule],
  controllers: [AdminCompaniesController, AdminProjectsController, AdminInventoryController],
  providers: [AdminCompaniesService, AdminInventoryService],
})
export class AdminCompaniesModule {}
