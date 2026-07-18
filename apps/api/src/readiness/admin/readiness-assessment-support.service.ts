import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { Prisma } from "@toonexpo/db";
import {
  ReadinessAssessmentTargetType,
  ReadinessScoreStatus,
} from "@toonexpo/db";

import { PrismaService } from "../../prisma/prisma.service.js";
import { calculateWeightedOverallScore } from "../utils/overall-score.util.js";
import type { ListReadinessAssessmentsQueryDto } from "./dto/readiness-assessment.dto.js";

type ActiveTargetFilter = {
  targetType: ReadinessAssessmentTargetType;
  builderCompanyId: string;
  projectId: string | null;
};

@Injectable()
export class ReadinessAssessmentSupportService {
  constructor(private readonly prisma: PrismaService) {}

  buildListWhere(
    query: ListReadinessAssessmentsQueryDto,
  ): Prisma.ReadinessAssessmentWhereInput {
    return {
      ...(query.builderCompanyId
        ? { builderCompanyId: query.builderCompanyId }
        : {}),
      ...(query.targetType ? { targetType: query.targetType } : {}),
      ...(query.status ? { status: query.status } : {}),
    };
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
      select: { id: true },
    });
    if (!company) {
      throw new NotFoundException("Company not found");
    }
  }

  async assertProjectBelongsToCompany(
    projectId: string,
    builderCompanyId: string,
  ): Promise<void> {
    const project = await this.prisma.db.project.findFirst({
      where: { id: projectId, builderCompanyId },
      select: { id: true },
    });
    if (!project) {
      throw new BadRequestException("Project does not belong to the company");
    }
  }

  async getAssessmentOrThrow(assessmentId: string) {
    const assessment = await this.prisma.db.readinessAssessment.findUnique({
      where: { id: assessmentId },
    });
    if (!assessment) {
      throw new NotFoundException("Readiness assessment not found");
    }
    return assessment;
  }

  async assertScoreBelongsToAssessment(
    assessmentId: string,
    scoreId: string,
  ): Promise<void> {
    const score = await this.prisma.db.readinessScore.findFirst({
      where: { id: scoreId, assessmentId },
      select: { id: true },
    });
    if (!score) {
      throw new BadRequestException("Score does not belong to this assessment");
    }
  }

  async recalculateOverallScore(
    tx: Prisma.TransactionClient,
    assessmentId: string,
  ): Promise<void> {
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
