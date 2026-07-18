import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ReadinessAssessmentTargetType,
  ReadinessScoreStatus,
} from "@toonexpo/db";

import type { PrismaService } from "../../prisma/prisma.service.js";
import { AdminReadinessAssessmentsService } from "../admin/admin-readiness-assessments.service.js";
import { ReadinessAssessmentSupportService } from "../admin/readiness-assessment-support.service.js";

describe("AdminReadinessAssessmentsService", () => {
  const transaction = vi.fn();
  const readinessAssessmentUpdateMany = vi.fn();
  const readinessAssessmentCreate = vi.fn();
  const readinessAssessmentFindUnique = vi.fn();
  const readinessAssessmentUpdate = vi.fn();
  const readinessCategoryFindMany = vi.fn();
  const readinessScoreUpsert = vi.fn();
  const companyFindUnique = vi.fn();

  let service: AdminReadinessAssessmentsService;

  beforeEach(() => {
    vi.clearAllMocks();

    transaction.mockImplementation(async (callback: (tx: unknown) => Promise<unknown>) =>
      callback({
        readinessAssessment: {
          updateMany: readinessAssessmentUpdateMany,
          create: readinessAssessmentCreate,
          update: readinessAssessmentUpdate,
          findUnique: readinessAssessmentFindUnique,
        },
        readinessScore: { upsert: readinessScoreUpsert },
      }),
    );

    const prisma = {
      db: {
        $transaction: transaction,
        readinessAssessment: {
          count: vi.fn(),
          findMany: vi.fn(),
          findUnique: readinessAssessmentFindUnique,
          update: readinessAssessmentUpdate,
        },
        readinessCategory: { findMany: readinessCategoryFindMany },
        company: { findUnique: companyFindUnique },
      },
    } as unknown as PrismaService;

    service = new AdminReadinessAssessmentsService(
      prisma,
      new ReadinessAssessmentSupportService(prisma),
    );
  });

  it("archives previous active assessment when creating a new one", async () => {
    companyFindUnique.mockResolvedValue({ id: "co_1" });
    readinessCategoryFindMany.mockResolvedValue([
      { id: "cat_1" },
      { id: "cat_2" },
    ]);
    readinessAssessmentCreate.mockResolvedValue({
      id: "asm_2",
      targetType: ReadinessAssessmentTargetType.builder_company,
      builderCompanyId: "co_1",
      projectId: null,
      status: ReadinessScoreStatus.not_started,
      overallScore: null,
      overallScoreOverridden: false,
      evaluatedByUserId: null,
      lastEvaluatedAt: null,
      archivedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      scores: [],
      recommendations: [],
      requiredActions: [],
      internalNotes: [],
    });

    await service.create({
      targetType: ReadinessAssessmentTargetType.builder_company,
      builderCompanyId: "co_1",
    });

    expect(readinessAssessmentUpdateMany).toHaveBeenCalledWith({
      where: {
        archivedAt: null,
        targetType: ReadinessAssessmentTargetType.builder_company,
        builderCompanyId: "co_1",
        projectId: null,
      },
      data: { archivedAt: expect.any(Date) },
    });
  });

  it("sets overallScoreOverridden when admin patches overallScore", async () => {
    readinessAssessmentFindUnique.mockResolvedValue({ id: "asm_1" });
    readinessAssessmentUpdate.mockResolvedValue({
      id: "asm_1",
      targetType: ReadinessAssessmentTargetType.builder_company,
      builderCompanyId: "co_1",
      projectId: null,
      status: ReadinessScoreStatus.ready,
      overallScore: 88,
      overallScoreOverridden: true,
      evaluatedByUserId: null,
      lastEvaluatedAt: null,
      archivedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      scores: [],
      recommendations: [],
      requiredActions: [],
      internalNotes: [],
    });

    const result = await service.update("asm_1", { overallScore: 88 });

    expect(readinessAssessmentUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          overallScore: 88,
          overallScoreOverridden: true,
        },
      }),
    );
    expect(result.overallScoreOverridden).toBe(true);
  });
});
