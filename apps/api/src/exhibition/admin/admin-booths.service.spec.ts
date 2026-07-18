import { NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PrismaService } from "../../prisma/prisma.service.js";
import { AdminBoothsService } from "./admin-booths.service.js";

describe("AdminBoothsService.listAssignments", () => {
  const boothFindUnique = vi.fn();
  const boothAssignmentFindMany = vi.fn();

  let service: AdminBoothsService;

  beforeEach(() => {
    vi.clearAllMocks();
    boothFindUnique.mockResolvedValue({ id: "booth_1" });

    const prisma = {
      db: {
        booth: { findUnique: boothFindUnique },
        boothAssignment: { findMany: boothAssignmentFindMany },
      },
    } as unknown as PrismaService;

    service = new AdminBoothsService(prisma);
  });

  it("returns assignments with resolved company and project names", async () => {
    const createdAt = new Date("2026-01-01T00:00:00.000Z");
    const updatedAt = new Date("2026-01-02T00:00:00.000Z");

    boothAssignmentFindMany.mockResolvedValue([
      {
        id: "assign_1",
        boothId: "booth_1",
        companyId: "co_1",
        projectId: "pr_1",
        assignmentLabel: null,
        sortOrder: 0,
        active: true,
        createdAt,
        updatedAt,
        company: { id: "co_1", name: "Alpha Builders" },
        project: { id: "pr_1", name: "Skyline Tower" },
      },
    ]);

    const result = await service.listAssignments("booth_1");

    expect(result.data).toEqual([
      {
        id: "assign_1",
        boothId: "booth_1",
        companyId: "co_1",
        projectId: "pr_1",
        assignmentLabel: null,
        sortOrder: 0,
        active: true,
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
        companyName: "Alpha Builders",
        projectName: "Skyline Tower",
      },
    ]);
  });

  it("rejects unknown booths", async () => {
    boothFindUnique.mockResolvedValue(null);

    await expect(service.listAssignments("missing")).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(boothAssignmentFindMany).not.toHaveBeenCalled();
  });
});
