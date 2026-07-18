import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module.js";
import { AdminReadinessAssessmentsController } from "./admin/admin-readiness-assessments.controller.js";
import { AdminReadinessAssessmentsService } from "./admin/admin-readiness-assessments.service.js";
import { AdminReadinessCategoriesController } from "./admin/admin-readiness-categories.controller.js";
import { AdminReadinessCategoriesService } from "./admin/admin-readiness-categories.service.js";
import { AdminReadinessNestedService } from "./admin/admin-readiness-nested.service.js";
import { ReadinessAssessmentSupportService } from "./admin/readiness-assessment-support.service.js";

@Module({
  imports: [PrismaModule],
  controllers: [
    AdminReadinessCategoriesController,
    AdminReadinessAssessmentsController,
  ],
  providers: [
    AdminReadinessCategoriesService,
    AdminReadinessAssessmentsService,
    AdminReadinessNestedService,
    ReadinessAssessmentSupportService,
  ],
})
export class ReadinessModule {}
