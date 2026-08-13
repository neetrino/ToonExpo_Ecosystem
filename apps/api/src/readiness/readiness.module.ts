import { Module } from '@nestjs/common';

import { CompanyMemberGuard } from '../company/guards/company-member.guard.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AdminReadinessAssessmentsController } from './admin/admin-readiness-assessments.controller.js';
import { AdminReadinessAssessmentsService } from './admin/admin-readiness-assessments.service.js';
import { AdminReadinessCategoriesController } from './admin/admin-readiness-categories.controller.js';
import { AdminReadinessCategoriesService } from './admin/admin-readiness-categories.service.js';
import { AdminReadinessCriteriaController } from './admin/admin-readiness-criteria.controller.js';
import { AdminReadinessCriteriaService } from './admin/admin-readiness-criteria.service.js';
import { AdminReadinessNestedService } from './admin/admin-readiness-nested.service.js';
import { ReadinessAssessmentSupportService } from './admin/readiness-assessment-support.service.js';
import { PortalReadinessController } from './portal/portal-readiness.controller.js';
import { PortalReadinessService } from './portal/portal-readiness.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [
    AdminReadinessCategoriesController,
    AdminReadinessCriteriaController,
    AdminReadinessAssessmentsController,
    PortalReadinessController,
  ],
  providers: [
    AdminReadinessCategoriesService,
    AdminReadinessCriteriaService,
    AdminReadinessAssessmentsService,
    AdminReadinessNestedService,
    ReadinessAssessmentSupportService,
    PortalReadinessService,
    CompanyMemberGuard,
  ],
  exports: [AdminReadinessAssessmentsService],
})
export class ReadinessModule {}
