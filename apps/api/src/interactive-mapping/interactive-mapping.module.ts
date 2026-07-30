import { Module } from '@nestjs/common';

import { CompanyMemberGuard } from '../company/guards/company-member.guard.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { InteractiveMappingController } from './interactive-mapping.controller.js';
import { InteractiveMappingService } from './interactive-mapping.service.js';
import { PortalInteractiveMappingController } from './portal-interactive-mapping.controller.js';

@Module({
  imports: [PrismaModule],
  controllers: [InteractiveMappingController, PortalInteractiveMappingController],
  providers: [InteractiveMappingService, CompanyMemberGuard],
})
export class InteractiveMappingModule {}
