import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ReadinessAssessmentTargetType,
  ReadinessScoreStatus,
  ReadinessVisibility,
} from "@toonexpo/db";

import type { PrismaService } from "../../prisma/prisma.service.js";
import { PortalReadinessService } from "./portal-readiness.service.js";

describe("PortalReadinessService visibility filtering", () => {
  const readinessAssessmentFindFirst = vi.fn();
  const projectFindMany = vi.fn();
  let service: PortalReadinessService;

  const member = {
    companyId: "co_1",
    userId: "user_1",
    role: "company_admin" as const,
    companyType: "builder" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    const prisma = {
      db: {
        readinessAssessment: { findFirst: readinessAssessmentFindFirst },
        project: { findMany: projectFindMany },
      },
    } as unknown as PrismaService;

    service = new PortalReadinessService(prisma);
    projectFindMany.mockResolvedValue([]);
  });

  it("never exposes internal notes or internal_only items in mapped response", async () => {
    readinessAssessmentFindFirst.mockResolvedValue({
      id: "asm_1",
      targetType: ReadinessAssessmentTargetType.builder_company,
      builderCompanyId: "co_1",
      projectId: null,
      status: ReadinessScoreStatus.in_progress,
      overallScore: 55,
      lastEvaluatedAt: new Date("2026-07-18T10:00:00.000Z"),
      project: null,
      scores: [
        {
          categoryId: "cat_1",
          score: 55,
          status: ReadinessScoreStatus.in_progress,
          recommendationSummary: "Improve media",
          category: { name: "Media materials" },
        },
      ],
      recommendations: [
        {
          id: "rec_visible",
          title: "Upload cover",
          description: "Add a cover image",
          sortOrder: 0,
          scoreId: null,
          visibility: ReadinessVisibility.builder_visible,
        },
      ],
      requiredActions: [
        {
          id: "act_visible",
          title: "Add floorplan",
          description: null,
          status: "open",
          scoreId: null,
          relatedEntityType: null,
          relatedEntityId: null,
          visibility: ReadinessVisibility.builder_visible,
        },
      ],
    });

    const result = await service.getCompanyReadiness(member);
    const assessment = result.data[0];

    expect(assessment).toBeDefined();
    expect(JSON.stringify(result)).not.toContain("internal_only");
    expect(JSON.stringify(result)).not.toContain("internalNotes");
    expect(JSON.stringify(result)).not.toContain("Internal note");
    expect(assessment?.recommendations).toHaveLength(1);
    expect(assessment?.requiredActions).toHaveLength(1);
  });

  it("queries portal include with builder_visible filters only", async () => {
    readinessAssessmentFindFirst.mockResolvedValue(null);

    await service.getCompanyReadiness(member);

    expect(readinessAssessmentFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          recommendations: expect.objectContaining({
            where: { visibility: ReadinessVisibility.builder_visible },
          }),
          requiredActions: expect.objectContaining({
            where: { visibility: ReadinessVisibility.builder_visible },
          }),
        }),
      }),
    );

    const include = readinessAssessmentFindFirst.mock.calls[0]?.[0]?.include;
    expect(include).not.toHaveProperty("internalNotes");
  });
});
