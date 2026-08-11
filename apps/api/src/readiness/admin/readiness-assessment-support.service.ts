import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@toonexpo/db';
import { ReadinessAssessmentTargetType, ReadinessScoreStatus } from '@toonexpo/db';

import { PrismaService } from '../../prisma/prisma.service.js';
import { calculateCategoryScoreFromCriteria } from '../utils/criterion-score.util.js';
import { calculateWeightedOverallScore } from '../utils/overall-score.util.js';
import { deriveStatusFromScore } from '../utils/score-status.util.js';
import type { ListReadinessAssessmentsQueryDto } from './dto/readiness-assessment.dto.js';

type ActiveTargetFilter = {
  targetType: ReadinessAssessmentTargetType;
  builderCompanyId: string;
  projectId: string | null;
};

@Injectable()
export class ReadinessAssessmentSupportService {
  constructor(private readonly prisma: PrismaService) {}

  buildListWhere(query: ListReadinessAssessmentsQueryDto): Prisma.ReadinessAssessmentWhereInput {
    return {
      ...(query.builderCompanyId ? { builderCompanyId: query.builderCompanyId } : {}),
      ...(query.projectId ? { projectId: query.projectId } : {}),
      ...(query.targetType ? { targetType: query.targetType } : {}),
      ...(query.status ? { status: query.status } : {}),
    };
  }

  async listActiveCriteria() {
    return this.prisma.db.readinessCriterion.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
    });
  }

  async archiveActiveAssessments(
    tx: Prisma.TransactionClient,
    filter: ActiveTargetFilter,
  ): Promise<void> {
    await tx.readinessAssessment.updateMany({
      where: {
        archivedAt: null,
        targetType: filter.targetType,
        builderCompanyId: filter.builderCompanyId,
        projectId: filter.projectId,
      },
      data: { archivedAt: new Date() },
    });
  }

  async assertCompanyExists(companyId: string): Promise<void> {
    const company = await this.prisma.db.company.findUnique({
      where: { id: companyId },
      select: { id: true, type: true },
    });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    if (company.type !== 'builder') {
      throw new BadRequestException('Readiness assessments require a builder company');
    }
  }

  async assertProjectBelongsToCompany(projectId: string, builderCompanyId: string): Promise<void> {
    const project = await this.prisma.db.project.findFirst({
      where: { id: projectId, builderCompanyId },
      select: { id: true },
    });
    if (!project) {
      throw new BadRequestException('Project does not belong to the company');
    }
  }

  async getAssessmentOrThrow(assessmentId: string) {
    const assessment = await this.prisma.db.readinessAssessment.findUnique({
      where: { id: assessmentId },
    });
    if (!assessment) {
      throw new NotFoundException('Readiness assessment not found');
    }
    return assessment;
  }

  async assertScoreBelongsToAssessment(assessmentId: string, scoreId: string): Promise<void> {
    const score = await this.prisma.db.readinessScore.findFirst({
      where: { id: scoreId, assessmentId },
      select: { id: true },
    });
    if (!score) {
      throw new BadRequestException('Score does not belong to this assessment');
    }
  }

  async recalculateCategoryScoreFromCriteria(
    tx: Prisma.TransactionClient,
    assessmentId: string,
    categoryId: string,
    evaluatorUserId: string,
    evaluatedAt: Date,
  ): Promise<void> {
    const criteria = await tx.readinessCriterion.findMany({
      where: { categoryId, active: true },
      select: {
        id: true,
        maxPoints: true,
        parentId: true,
        children: { where: { active: true }, select: { id: true } },
      },
    });

    const scores = await tx.readinessCriterionScore.findMany({
      where: {
        assessmentId,
        criterionId: { in: criteria.map((criterion) => criterion.id) },
      },
      select: { criterionId: true, value: true },
    });
    const valueByCriterionId = new Map(scores.map((row) => [row.criterionId, row.value]));

    const categoryScore = calculateCategoryScoreFromCriteria(
      criteria.map((criterion) => ({
        maxPoints: criterion.maxPoints,
        value: valueByCriterionId.get(criterion.id) ?? null,
        hasChildren: criterion.children.length > 0,
      })),
    );

    const status =
      categoryScore === null
        ? ReadinessScoreStatus.not_started
        : deriveStatusFromScore(categoryScore);

    await tx.readinessScore.upsert({
      where: {
        assessmentId_categoryId: { assessmentId, categoryId },
      },
      create: {
        assessmentId,
        categoryId,
        score: categoryScore,
        status,
        evaluatedByUserId: evaluatorUserId,
        evaluatedAt,
      },
      update: {
        score: categoryScore,
        status,
        evaluatedByUserId: evaluatorUserId,
        evaluatedAt,
      },
    });
  }

  async recalculateOverallScore(tx: Prisma.TransactionClient, assessmentId: string): Promise<void> {
    const assessment = await tx.readinessAssessment.findUnique({
      where: { id: assessmentId },
      select: { overallScoreOverridden: true },
    });
    if (!assessment || assessment.overallScoreOverridden) {
      return;
    }

    const scores = await tx.readinessScore.findMany({
      where: { assessmentId, score: { not: null } },
      include: { category: { select: { weight: true } } },
    });

    const overallScore = calculateWeightedOverallScore(
      scores.map((row) => ({
        score: row.score as number,
        weight: row.category.weight,
      })),
    );

    await tx.readinessAssessment.update({
      where: { id: assessmentId },
      data: { overallScore },
    });
  }

  resolveInitialStatus(): ReadinessScoreStatus {
    return ReadinessScoreStatus.not_started;
  }
}
