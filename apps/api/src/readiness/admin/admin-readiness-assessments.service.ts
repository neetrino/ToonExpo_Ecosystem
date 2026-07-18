import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type {
  ReadinessAssessmentDetail,
  ReadinessAssessmentListResponse,
  ReadinessScoreItem,
} from "@toonexpo/contracts";
import {
  ReadinessAssessmentTargetType,
  ReadinessScoreStatus,
} from "@toonexpo/db";

import { PrismaService } from "../../prisma/prisma.service.js";
import {
  assessmentDetailInclude,
  toReadinessAssessmentDetail,
  toReadinessAssessmentListItem,
  toReadinessScoreItem,
} from "../mappers/readiness.mapper.js";
import { deriveStatusFromScore } from "../utils/score-status.util.js";
import { ReadinessAssessmentSupportService } from "./readiness-assessment-support.service.js";
import type { CreateReadinessAssessmentDto } from "./dto/readiness-assessment.dto.js";
import type { ListReadinessAssessmentsQueryDto } from "./dto/readiness-assessment.dto.js";
import type { UpdateReadinessAssessmentDto } from "./dto/readiness-assessment.dto.js";
import type { UpsertReadinessScoreDto } from "./dto/readiness-assessment.dto.js";

@Injectable()
export class AdminReadinessAssessmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly support: ReadinessAssessmentSupportService,
  ) {}

  async list(
    query: ListReadinessAssessmentsQueryDto,
  ): Promise<ReadinessAssessmentListResponse> {
    const where = this.support.buildListWhere(query);
    const skip = (query.page - 1) * query.pageSize;

    const [total, rows] = await this.prisma.db.$transaction([
      this.prisma.db.readinessAssessment.count({ where }),
      this.prisma.db.readinessAssessment.findMany({
        where,
        orderBy: { createdAt: "desc" },
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
    const assessment = await this.prisma.db.readinessAssessment.findUnique({
      where: { id },
      include: assessmentDetailInclude,
    });
    if (!assessment) {
      throw new NotFoundException("Readiness assessment not found");
    }
    return toReadinessAssessmentDetail(assessment);
  }

  async create(body: CreateReadinessAssessmentDto): Promise<ReadinessAssessmentDetail> {
    await this.support.assertCompanyExists(body.builderCompanyId);

    if (body.targetType === ReadinessAssessmentTargetType.project) {
      if (!body.projectId) {
        throw new BadRequestException("projectId is required for project assessments");
      }
      await this.support.assertProjectBelongsToCompany(
        body.projectId,
        body.builderCompanyId,
      );
    } else if (body.projectId) {
      throw new BadRequestException("projectId must be omitted for company assessments");
    }

    const activeCategories = await this.prisma.db.readinessCategory.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

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
        },
        include: assessmentDetailInclude,
      });
    });

    return toReadinessAssessmentDetail(assessment);
  }

  async update(
    id: string,
    body: UpdateReadinessAssessmentDto,
  ): Promise<ReadinessAssessmentDetail> {
    await this.support.getAssessmentOrThrow(id);

    const assessment = await this.prisma.db.readinessAssessment.update({
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
    });

    return toReadinessAssessmentDetail(assessment);
  }

  async upsertScore(
    assessmentId: string,
    categoryId: string,
    evaluatorUserId: string,
    body: UpsertReadinessScoreDto,
  ): Promise<ReadinessScoreItem> {
    await this.support.getAssessmentOrThrow(assessmentId);

    const category = await this.prisma.db.readinessCategory.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException("Readiness category not found");
    }

    const evaluatedAt = new Date();
    const resolvedStatus = this.resolveScoreStatus(body);

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

    return toReadinessScoreItem(score);
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
