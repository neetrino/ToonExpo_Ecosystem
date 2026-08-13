import { Injectable } from '@nestjs/common';
import type { PortalReadinessResponse } from '@toonexpo/contracts';
import { ReadinessAssessmentTargetType, ReadinessVisibility } from '@toonexpo/db';

import type { CompanyMemberContext } from '../../company/types/company-member-context.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { toPortalReadinessAssessmentItem } from '../mappers/readiness.mapper.js';

@Injectable()
export class PortalReadinessService {
  constructor(private readonly prisma: PrismaService) {}

  async getCompanyReadiness(member: CompanyMemberContext): Promise<PortalReadinessResponse> {
    const companyId = member.companyId;
    const catalogCriteria = await this.prisma.db.readinessCriterion.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
    });

    const [companyAssessment, projectAssessments] = await Promise.all([
      this.findActiveAssessment(
        {
          targetType: ReadinessAssessmentTargetType.builder_company,
          builderCompanyId: companyId,
          projectId: null,
        },
        catalogCriteria,
      ),
      this.findActiveProjectAssessments(companyId, catalogCriteria),
    ]);

    const data = [...(companyAssessment ? [companyAssessment] : []), ...projectAssessments];

    return { data };
  }

  private async findActiveAssessment(
    where: {
      targetType: ReadinessAssessmentTargetType;
      builderCompanyId: string;
      projectId: string | null;
    },
    catalogCriteria: Awaited<ReturnType<PrismaService['db']['readinessCriterion']['findMany']>>,
  ) {
    const assessment = await this.prisma.db.readinessAssessment.findFirst({
      where: {
        ...where,
        archivedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      include: this.portalInclude(),
    });

    if (!assessment) {
      return null;
    }

    const helpByProviderCategoryId = await this.buildHelpAvailabilityMap([
      ...assessment.scores.map((score) => score.category.serviceProviderCategoryId),
      ...catalogCriteria.map((criterion) => criterion.serviceProviderCategoryId),
    ]);

    return toPortalReadinessAssessmentItem(assessment, helpByProviderCategoryId, catalogCriteria);
  }

  private async findActiveProjectAssessments(
    companyId: string,
    catalogCriteria: Awaited<ReturnType<PrismaService['db']['readinessCriterion']['findMany']>>,
  ) {
    const projects = await this.prisma.db.project.findMany({
      where: { builderCompanyId: companyId },
      select: { id: true },
    });

    if (projects.length === 0) {
      return [];
    }

    const projectIds = projects.map((project) => project.id);
    const assessments = await this.prisma.db.readinessAssessment.findMany({
      where: {
        targetType: ReadinessAssessmentTargetType.project,
        builderCompanyId: companyId,
        projectId: { in: projectIds },
        archivedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      include: this.portalInclude(),
    });

    const latestByProjectId = new Map<string, (typeof assessments)[number]>();
    for (const assessment of assessments) {
      if (!assessment.projectId || latestByProjectId.has(assessment.projectId)) {
        continue;
      }
      latestByProjectId.set(assessment.projectId, assessment);
    }

    const latestAssessments = [...latestByProjectId.values()];
    if (latestAssessments.length === 0) {
      return [];
    }

    const helpByProviderCategoryId = await this.buildHelpAvailabilityMap([
      ...latestAssessments.flatMap((assessment) =>
        assessment.scores.map((score) => score.category.serviceProviderCategoryId),
      ),
      ...catalogCriteria.map((criterion) => criterion.serviceProviderCategoryId),
    ]);

    return latestAssessments.map((assessment) =>
      toPortalReadinessAssessmentItem(assessment, helpByProviderCategoryId, catalogCriteria),
    );
  }

  private async buildHelpAvailabilityMap(
    providerCategoryIds: readonly (string | null)[],
  ): Promise<Map<string, boolean>> {
    const categoryIds = [
      ...new Set(providerCategoryIds.filter((value): value is string => value != null)),
    ];

    if (categoryIds.length === 0) {
      return new Map();
    }

    const counts = await this.prisma.db.serviceProviderCategoryLink.groupBy({
      by: ['serviceProviderCategoryId'],
      where: {
        serviceProviderCategoryId: { in: categoryIds },
        serviceProvider: { active: true },
      },
      _count: { serviceProviderId: true },
    });

    return new Map(
      counts.map((row) => [row.serviceProviderCategoryId, row._count.serviceProviderId > 0]),
    );
  }

  private portalInclude() {
    return {
      project: {
        select: {
          name: true,
          coverMedia: { select: { fileUrl: true, thumbnailUrl: true } },
        },
      },
      scores: {
        include: { category: true },
        orderBy: { category: { sortOrder: 'asc' as const } },
      },
      criterionScores: {
        include: { criterion: true },
      },
      recommendations: {
        where: { visibility: ReadinessVisibility.builder_visible },
        orderBy: [{ sortOrder: 'asc' as const }, { createdAt: 'asc' as const }],
      },
      requiredActions: {
        where: { visibility: ReadinessVisibility.builder_visible },
        orderBy: { createdAt: 'asc' as const },
      },
    };
  }
}
