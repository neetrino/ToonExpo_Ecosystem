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

    if (!assessment) {
      return null;
    }

    const helpAvailabilityByCategoryId =
      await this.buildHelpAvailabilityMap(assessment.scores);

    return toPortalReadinessAssessmentItem(
      assessment,
      helpAvailabilityByCategoryId,
    );
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

  private async buildHelpAvailabilityMap(
    scores: Array<{
      categoryId: string;
      category: { serviceProviderCategoryId: string | null };
    }>,
  ): Promise<Map<string, boolean>> {
    const categoryIds = [
      ...new Set(
        scores
          .map((score) => score.category.serviceProviderCategoryId)
          .filter((value): value is string => value != null),
      ),
    ];

    if (categoryIds.length === 0) {
      return new Map();
    }

    const counts = await this.prisma.db.serviceProviderCategoryLink.groupBy({
      by: ["serviceProviderCategoryId"],
      where: {
        serviceProviderCategoryId: { in: categoryIds },
        serviceProvider: { active: true },
      },
      _count: { serviceProviderId: true },
    });

    const activeCounts = new Map(
      counts.map((row) => [row.serviceProviderCategoryId, row._count.serviceProviderId]),
    );

    const helpByScoreCategory = new Map<string, boolean>();

    for (const score of scores) {
      const linkedCategoryId = score.category.serviceProviderCategoryId;
      const helpAvailable =
        linkedCategoryId != null &&
        (activeCounts.get(linkedCategoryId) ?? 0) > 0;
      helpByScoreCategory.set(score.categoryId, helpAvailable);
    }

    return helpByScoreCategory;
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
