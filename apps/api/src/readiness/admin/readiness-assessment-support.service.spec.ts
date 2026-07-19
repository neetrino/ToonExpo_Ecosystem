import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PrismaService } from "../../prisma/prisma.service.js";
import { ReadinessAssessmentSupportService } from "./readiness-assessment-support.service.js";

describe("ReadinessAssessmentSupportService recalculateOverallScore", () => {
  const readinessAssessmentFindUnique = vi.fn();
  const readinessAssessmentUpdate = vi.fn();
  const readinessScoreFindMany = vi.fn();
  let support: ReadinessAssessmentSupportService;

  beforeEach(() => {
    vi.clearAllMocks();
    const prisma = {} as unknown as PrismaService;
    support = new ReadinessAssessmentSupportService(prisma);
  });

  it("skips recalculation when overall score is overridden", async () => {
    readinessAssessmentFindUnique.mockResolvedValue({
      overallScoreOverridden: true,
    });

    await support.recalculateOverallScore(
      {
        readinessAssessment: {
          findUnique: readinessAssessmentFindUnique,
          update: readinessAssessmentUpdate,
        },
        readinessScore: { findMany: readinessScoreFindMany },
      },
      "asm_1",
    );

    expect(readinessScoreFindMany).not.toHaveBeenCalled();
    expect(readinessAssessmentUpdate).not.toHaveBeenCalled();
  });

  it("updates overall score from weighted category scores when not overridden", async () => {
    readinessAssessmentFindUnique.mockResolvedValue({
      overallScoreOverridden: false,
    });
    readinessScoreFindMany.mockResolvedValue([
      { score: 80, category: { weight: 2 } },
      { score: 50, category: { weight: 1 } },
    ]);

    await support.recalculateOverallScore(
      {
        readinessAssessment: {
          findUnique: readinessAssessmentFindUnique,
          update: readinessAssessmentUpdate,
        },
        readinessScore: { findMany: readinessScoreFindMany },
      },
      "asm_1",
    );

    expect(readinessAssessmentUpdate).toHaveBeenCalledWith({
      where: { id: "asm_1" },
      data: { overallScore: 70 },
    });
  });
});
