import { Injectable } from "@nestjs/common";
import type { PortalReadinessResponse } from "@toonexpo/contracts";
import {
  ReadinessAssessmentTargetType,
  ReadinessVisibility,
} from "@toonexpo/db";

import type { CompanyMemberContext } from "../../company/types/company-member-context.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { toPortalReadinessAssessmentItem } from "../mappers/readiness.mapper.js";

@Injectable()
export class PortalReadinessService {
  constructor(private readonly prisma: PrismaService) {}

  async getCompanyReadiness(
    member: CompanyMemberContext,
  ): Promise<PortalReadinessResponse> {
    const companyId = member.companyId;

    const [companyAssessment, projectAssessments] = await Promise.all([
      this.findActiveAssessment({
        targetType: ReadinessAssessmentTargetType.builder_company,
        builderCompanyId: companyId,
        projectId: null,
      }),
      this.findActiveProjectAssessments(companyId),
    ]);

    const data = [...(companyAssessment ? [companyAssessment] : []), ...projectAssessments];

    return { data };
  }

  private async findActiveAssessment(where: {
    targetType: ReadinessAssessmentTargetType;
    builderCompanyId: string;
    projectId: string | null;
  }) {
    const assessment = await this.prisma.db.readinessAssessment.findFirst({
      where: {
        ...where,
        archivedAt: null,
      },
      orderBy: { createdAt: "desc" },
      include: this.portalInclude(),
    });

    return assessment ? toPortalReadinessAssessmentItem(assessment) : null;
  }

  private async findActiveProjectAssessments(companyId: string) {
    const projects = await this.prisma.db.project.findMany({
      where: { builderCompanyId: companyId },
      select: { id: true },
    });

    const assessments = await Promise.all(
      projects.map((project) =>
        this.findActiveAssessment({
          targetType: ReadinessAssessmentTargetType.project,
          builderCompanyId: companyId,
          projectId: project.id,
        }),
      ),
    );

    return assessments.filter(
      (item): item is NonNullable<typeof item> => item !== null,
    );
  }

  private portalInclude() {
    return {
      project: { select: { name: true } },
      scores: {
        include: { category: true },
        orderBy: { category: { sortOrder: "asc" as const } },
      },
      recommendations: {
        where: { visibility: ReadinessVisibility.builder_visible },
        orderBy: [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }],
      },
      requiredActions: {
        where: { visibility: ReadinessVisibility.builder_visible },
        orderBy: { createdAt: "asc" as const },
      },
    };
  }
}
