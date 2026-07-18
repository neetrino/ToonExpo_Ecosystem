import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PrismaService } from "../../prisma/prisma.service.js";
import { loadPortalAnalyticsOverview } from "./portal-analytics-aggregates.js";

describe("loadPortalAnalyticsOverview company scoping", () => {
  const analyticsGroupBy = vi.fn();
  const requestGroupBy = vi.fn();
  const crmDealGroupBy = vi.fn();
  const apartmentGroupBy = vi.fn();
  const readinessFindFirst = vi.fn();
  const projectFindMany = vi.fn();
  const apartmentFindMany = vi.fn();

  let prisma: PrismaService;

  beforeEach(() => {
    vi.clearAllMocks();
    analyticsGroupBy.mockResolvedValue([]);
    requestGroupBy.mockResolvedValue([]);
    crmDealGroupBy.mockResolvedValue([]);
    apartmentGroupBy.mockResolvedValue([]);
    readinessFindFirst.mockResolvedValue(null);
    projectFindMany.mockResolvedValue([]);
    apartmentFindMany.mockResolvedValue([]);

    prisma = {
      db: {
        analyticsEvent: { groupBy: analyticsGroupBy },
        request: { groupBy: requestGroupBy },
        crmDeal: { groupBy: crmDealGroupBy },
        apartment: { groupBy: apartmentGroupBy, findMany: apartmentFindMany },
        readinessAssessment: { findFirst: readinessFindFirst },
        project: { findMany: projectFindMany },
      },
    } as unknown as PrismaService;
  });

  it("scopes event and request queries to the builder company", async () => {
    const from = new Date("2026-06-18T00:00:00.000Z");
    const to = new Date("2026-07-18T00:00:00.000Z");

    await loadPortalAnalyticsOverview(prisma, "co_builder_a", {
      from,
      to,
      fromIso: from.toISOString(),
      toIso: to.toISOString(),
    });

    expect(analyticsGroupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ companyId: "co_builder_a" }),
      }),
    );
    expect(requestGroupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ builderCompanyId: "co_builder_a" }),
      }),
    );
    expect(crmDealGroupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ companyId: "co_builder_a" }),
      }),
    );
  });

  it("scopes project view aggregation to the requested company", async () => {
    analyticsGroupBy.mockResolvedValueOnce([
      { projectId: "proj_a", _count: { _all: 12 } },
    ]);
    projectFindMany.mockResolvedValueOnce([{ id: "proj_a", name: "Mine" }]);

    const from = new Date("2026-06-18T00:00:00.000Z");
    const to = new Date("2026-07-18T00:00:00.000Z");

    const overview = await loadPortalAnalyticsOverview(prisma, "co_builder_a", {
      from,
      to,
      fromIso: from.toISOString(),
      toIso: to.toISOString(),
    });

    const projectViewCall = analyticsGroupBy.mock.calls.find((call) => {
      const where = call[0]?.where as { eventType?: string } | undefined;
      return where?.eventType === "project_view";
    });

    expect(projectViewCall?.[0]?.where).toMatchObject({
      companyId: "co_builder_a",
      eventType: "project_view",
    });
    expect(overview.topProjectsByViews).toEqual([
      { entityId: "proj_a", name: "Mine", viewCount: 12 },
    ]);
  });
});
