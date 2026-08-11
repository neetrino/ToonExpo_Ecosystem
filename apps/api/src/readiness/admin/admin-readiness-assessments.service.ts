import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type {
  ReadinessAssessmentDetail,
  ReadinessAssessmentListResponse,
  ReadinessScoreItem,
} from '@toonexpo/contracts';
import { ReadinessAssessmentTargetType, ReadinessScoreStatus } from '@toonexpo/db';

import { PrismaService } from '../../prisma/prisma.service.js';
import { AnalyticsService } from '../../analytics/analytics.service.js';
import {
  assessmentDetailInclude,
  assessmentListInclude,
  toReadinessAssessmentDetail,
  toReadinessAssessmentListItem,
  toReadinessScoreItem,
} from '../mappers/readiness.mapper.js';
import { deriveStatusFromScore } from '../utils/score-status.util.js';
import { ReadinessAssessmentSupportService } from './readiness-assessment-support.service.js';
import type { CreateReadinessAssessmentDto } from './dto/readiness-assessment.dto.js';
import type { ListReadinessAssessmentsQueryDto } from './dto/readiness-assessment.dto.js';
import type { UpdateReadinessAssessmentDto } from './dto/readiness-assessment.dto.js';
import type { UpsertReadinessCriterionScoreDto } from './dto/readiness-assessment.dto.js';
import type { UpsertReadinessCriterionScoresBatchDto } from './dto/readiness-assessment.dto.js';
import type { UpsertReadinessScoreDto } from './dto/readiness-assessment.dto.js';

@Injectable()
export class AdminReadinessAssessmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly support: ReadinessAssessmentSupportService,
    private readonly analytics: AnalyticsService,
  ) {}

  async list(query: ListReadinessAssessmentsQueryDto): Promise<ReadinessAssessmentListResponse> {
    const where = this.support.buildListWhere(query);
    const skip = (query.page - 1) * query.pageSize;

    const [total, rows] = await Promise.all([
      this.prisma.db.readinessAssessment.count({ where }),
      this.prisma.db.readinessAssessment.findMany({
        where,
        include: assessmentListInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.pageSize,
      }),
    ]);

    return {
      data: rows.map(toReadinessAssessmentListItem),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / query.pageSize),
      },
    };
  }

  async getById(id: string): Promise<ReadinessAssessmentDetail> {
    const [assessment, catalogCriteria] = await Promise.all([
      this.prisma.db.readinessAssessment.findUnique({
        where: { id },
        include: assessmentDetailInclude,
      }),
      this.support.listActiveCriteria(),
    ]);
    if (!assessment) {
      throw new NotFoundException('Readiness assessment not found');
    }
    return toReadinessAssessmentDetail(assessment, catalogCriteria);
  }

  async create(body: CreateReadinessAssessmentDto): Promise<ReadinessAssessmentDetail> {
    await this.support.assertCompanyExists(body.builderCompanyId);

    if (body.targetType === ReadinessAssessmentTargetType.project) {
      if (!body.projectId) {
        throw new BadRequestException('projectId is required for project assessments');
      }
      await this.support.assertProjectBelongsToCompany(body.projectId, body.builderCompanyId);
    } else if (body.projectId) {
      throw new BadRequestException('projectId must be omitted for company assessments');
    }

    const [activeCategories, activeCriteria] = await Promise.all([
      this.prisma.db.readinessCategory.findMany({
        where: { active: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      }),
      this.support.listActiveCriteria(),
    ]);

    const assessment = await this.prisma.db.$transaction(async (tx) => {
      await this.support.archiveActiveAssessments(tx, {
        targetType: body.targetType,
        builderCompanyId: body.builderCompanyId,
        projectId:
          body.targetType === ReadinessAssessmentTargetType.project
            ? (body.projectId ?? null)
            : null,
      });

      return tx.readinessAssessment.create({
        data: {
          targetType: body.targetType,
          builderCompanyId: body.builderCompanyId,
          projectId:
            body.targetType === ReadinessAssessmentTargetType.project
              ? (body.projectId ?? null)
              : null,
          status: ReadinessScoreStatus.not_started,
          scores: {
            create: activeCategories.map((category) => ({
              categoryId: category.id,
              status: ReadinessScoreStatus.not_started,
            })),
          },
          criterionScores: {
            create: activeCriteria.map((criterion) => ({
              criterionId: criterion.id,
              value: null,
              checked: false,
            })),
          },
        },
        include: assessmentDetailInclude,
      });
    });

    return toReadinessAssessmentDetail(assessment, activeCriteria);
  }

  /**
   * Ensures every builder company has an active company-level readiness assessment.
   * Keeps Admin Builders ↔ Readiness lists in sync.
   */
  async ensureBuilderCompanyAssessments(): Promise<{ createdCount: number }> {
    const builders = await this.prisma.db.company.findMany({
      where: { type: 'builder' },
      select: { id: true },
      orderBy: { createdAt: 'asc' },
    });

    if (builders.length === 0) {
      return { createdCount: 0 };
    }

    const existing = await this.prisma.db.readinessAssessment.findMany({
      where: {
        targetType: ReadinessAssessmentTargetType.builder_company,
        archivedAt: null,
        builderCompanyId: { in: builders.map((builder) => builder.id) },
      },
      select: { builderCompanyId: true },
    });
    const covered = new Set(existing.map((row) => row.builderCompanyId));

    let createdCount = 0;
    for (const builder of builders) {
      if (covered.has(builder.id)) {
        continue;
      }
      await this.create({
        targetType: ReadinessAssessmentTargetType.builder_company,
        builderCompanyId: builder.id,
      });
      createdCount += 1;
    }

    return { createdCount };
  }

  async update(id: string, body: UpdateReadinessAssessmentDto): Promise<ReadinessAssessmentDetail> {
    const existing = await this.support.getAssessmentOrThrow(id);

    const [assessment, catalogCriteria] = await Promise.all([
      this.prisma.db.readinessAssessment.update({
        where: { id },
        data: {
          ...(body.status !== undefined ? { status: body.status } : {}),
          ...(body.overallScore !== undefined
            ? {
                overallScore: body.overallScore,
                overallScoreOverridden: true,
              }
            : {}),
          ...(body.archive === true ? { archivedAt: new Date() } : {}),
        },
        include: assessmentDetailInclude,
      }),
      this.support.listActiveCriteria(),
    ]);

    if (body.status !== undefined && body.status !== existing.status) {
      this.trackReadinessChange({
        companyId: existing.builderCompanyId,
        projectId: existing.projectId,
        categoryId: null,
        oldStatus: existing.status,
        newStatus: body.status,
        oldScore: existing.overallScore,
        newScore: body.overallScore ?? existing.overallScore,
      });
    }

    return toReadinessAssessmentDetail(assessment, catalogCriteria);
  }

  async upsertScore(
    assessmentId: string,
    categoryId: string,
    evaluatorUserId: string,
    body: UpsertReadinessScoreDto,
  ): Promise<ReadinessScoreItem> {
    const assessment = await this.support.getAssessmentOrThrow(assessmentId);

    const category = await this.prisma.db.readinessCategory.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException('Readiness category not found');
    }

    const evaluatedAt = new Date();
    const resolvedStatus = this.resolveScoreStatus(body);
    const previous = await this.prisma.db.readinessScore.findUnique({
      where: {
        assessmentId_categoryId: { assessmentId, categoryId },
      },
      select: { score: true, status: true },
    });

    const score = await this.prisma.db.$transaction(async (tx) => {
      const row = await tx.readinessScore.upsert({
        where: {
          assessmentId_categoryId: { assessmentId, categoryId },
        },
        create: {
          assessmentId,
          categoryId,
          score: body.score ?? null,
          status: resolvedStatus,
          recommendationSummary: body.recommendationSummary?.trim() || null,
          evaluatedByUserId: evaluatorUserId,
          evaluatedAt,
        },
        update: {
          ...(body.score !== undefined ? { score: body.score } : {}),
          status: resolvedStatus,
          ...(body.recommendationSummary !== undefined
            ? { recommendationSummary: body.recommendationSummary?.trim() || null }
            : {}),
          evaluatedByUserId: evaluatorUserId,
          evaluatedAt,
        },
        include: { category: true },
      });

      await tx.readinessAssessment.update({
        where: { id: assessmentId },
        data: {
          lastEvaluatedAt: evaluatedAt,
          evaluatedByUserId: evaluatorUserId,
        },
      });

      await this.support.recalculateOverallScore(tx, assessmentId);
      return row;
    });

    this.trackReadinessChange({
      companyId: assessment.builderCompanyId,
      projectId: assessment.projectId,
      categoryId,
      oldStatus: previous?.status ?? ReadinessScoreStatus.not_started,
      newStatus: resolvedStatus,
      oldScore: previous?.score ?? null,
      newScore: body.score ?? previous?.score ?? null,
    });

    const detail = await this.getById(assessmentId);
    const updated = detail.scores.find((row) => row.categoryId === categoryId);
    return updated ?? toReadinessScoreItem(score, []);
  }

  async upsertCriterionScore(
    assessmentId: string,
    criterionId: string,
    evaluatorUserId: string,
    body: UpsertReadinessCriterionScoreDto,
  ): Promise<ReadinessAssessmentDetail> {
    return this.upsertCriterionScoresBatch(assessmentId, evaluatorUserId, {
      items: [{ criterionId, ...body }],
    });
  }

  async upsertCriterionScoresBatch(
    assessmentId: string,
    evaluatorUserId: string,
    body: UpsertReadinessCriterionScoresBatchDto,
  ): Promise<ReadinessAssessmentDetail> {
    const assessment = await this.support.getAssessmentOrThrow(assessmentId);
    const criterionIds = [...new Set(body.items.map((item) => item.criterionId))];
    const criteria = await this.prisma.db.readinessCriterion.findMany({
      where: { id: { in: criterionIds }, active: true },
    });
    const criterionById = new Map(criteria.map((criterion) => [criterion.id, criterion]));

    if (criteria.length !== criterionIds.length) {
      throw new NotFoundException('One or more readiness criteria were not found');
    }

    for (const item of body.items) {
      const criterion = criterionById.get(item.criterionId);
      if (!criterion) {
        throw new NotFoundException('Readiness criterion not found');
      }
      if (item.value !== undefined && item.value !== null && criterion.maxPoints !== null) {
        if (item.value > criterion.maxPoints) {
          throw new BadRequestException(
            `value cannot exceed maxPoints (${criterion.maxPoints}) for ${criterion.code}`,
          );
        }
      }
    }

    const evaluatedAt = new Date();
    const affectedCategoryIds = new Set(criteria.map((criterion) => criterion.categoryId));

    await this.prisma.db.$transaction(async (tx) => {
      for (const item of body.items) {
        const nextValue =
          item.value === undefined
            ? undefined
            : item.value === null
              ? null
              : Math.max(0, item.value);
        const nextChecked =
          item.checked !== undefined
            ? item.checked
            : nextValue === undefined
              ? undefined
              : nextValue !== null;

        await tx.readinessCriterionScore.upsert({
          where: {
            assessmentId_criterionId: {
              assessmentId,
              criterionId: item.criterionId,
            },
          },
          create: {
            assessmentId,
            criterionId: item.criterionId,
            value: nextValue ?? null,
            checked: nextChecked ?? false,
          },
          update: {
            ...(nextValue !== undefined ? { value: nextValue } : {}),
            ...(nextChecked !== undefined ? { checked: nextChecked } : {}),
          },
        });
      }

      for (const categoryId of affectedCategoryIds) {
        await this.support.recalculateCategoryScoreFromCriteria(
          tx,
          assessmentId,
          categoryId,
          evaluatorUserId,
          evaluatedAt,
        );
      }

      await tx.readinessAssessment.update({
        where: { id: assessmentId },
        data: {
          lastEvaluatedAt: evaluatedAt,
          evaluatedByUserId: evaluatorUserId,
        },
      });

      await this.support.recalculateOverallScore(tx, assessmentId);
    });

    this.trackReadinessChange({
      companyId: assessment.builderCompanyId,
      projectId: assessment.projectId,
      categoryId: criteria[0]?.categoryId ?? null,
      oldStatus: assessment.status,
      newStatus: assessment.status,
      oldScore: assessment.overallScore,
      newScore: null,
    });

    return this.getById(assessmentId);
  }

  private trackReadinessChange(input: {
    companyId: string;
    projectId: string | null;
    categoryId: string | null;
    oldStatus: ReadinessScoreStatus;
    newStatus: ReadinessScoreStatus;
    oldScore: number | null;
    newScore: number | null;
  }): void {
    this.analytics.track({
      eventType: 'readiness_status_changed',
      companyId: input.companyId,
      projectId: input.projectId,
      metadata: {
        categoryId: input.categoryId,
        oldStatus: input.oldStatus,
        newStatus: input.newStatus,
        oldScore: input.oldScore,
        newScore: input.newScore,
      },
    });
  }

  private resolveScoreStatus(body: UpsertReadinessScoreDto): ReadinessScoreStatus {
    if (body.status !== undefined) {
      return body.status;
    }
    if (body.score !== undefined) {
      return deriveStatusFromScore(body.score);
    }
    return ReadinessScoreStatus.not_started;
  }
}
