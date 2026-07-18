import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PrismaService } from "../../prisma/prisma.service.js";
import { loadAdminAnalyticsOverview } from "./admin-analytics-aggregates.js";

describe("loadAdminAnalyticsOverview", () => {
  const userCount = vi.fn();
  const companyCount = vi.fn();
  const partnerCompanyCount = vi.fn();
  const projectCount = vi.fn();
  const apartmentCount = vi.fn();
  const analyticsGroupBy = vi.fn();
  const requestGroupBy = vi.fn();
  const crmDealGroupBy = vi.fn();
  const checkInGroupBy = vi.fn();
  const readinessGroupBy = vi.fn();
  const readinessScoreGroupBy = vi.fn();
  const projectFindMany = vi.fn();
  const readinessCategoryFindMany = vi.fn();

  let prisma: PrismaService;

  beforeEach(() => {
    vi.clearAllMocks();
    userCount.mockResolvedValueOnce(100).mockResolvedValueOnce(80);
    companyCount.mockResolvedValue(12);
    partnerCompanyCount.mockResolvedValue(5);
    projectCount.mockResolvedValue(20);
    apartmentCount.mockResolvedValue(200);
    analyticsGroupBy
      .mockResolvedValueOnce([
        { projectId: "proj_a", _count: { _all: 50 } },
        { projectId: "proj_b", _count: { _all: 30 } },
      ])
      .mockResolvedValueOnce([
        { source: "builder_scan", _count: { _all: 10 } },
      ]);
    requestGroupBy.mockResolvedValue([
      { source: "buyer_project_request", _count: { _all: 7 } },
      { source: "builder_buyer_qr_scan", _count: { _all: 3 } },
    ]);
    crmDealGroupBy.mockResolvedValue([
      { status: "new_request", _count: { _all: 4 } },
      { status: "contacted", _count: { _all: 2 } },
    ]);
    checkInGroupBy.mockResolvedValue([
      { status: "allowed", _count: { _all: 40 } },
      { status: "duplicate_checkin", _count: { _all: 5 } },
      { status: "denied_invalid_qr", _count: { _all: 2 } },
    ]);
    readinessGroupBy.mockResolvedValue([
      { status: "ready", _count: { _all: 3 } },
      { status: "needs_improvement", _count: { _all: 2 } },
    ]);
    readinessScoreGroupBy.mockResolvedValue([
      { categoryId: "cat_1", _avg: { score: 45 } },
    ]);
    projectFindMany.mockResolvedValue([
      { id: "proj_a", name: "Project Alpha" },
      { id: "proj_b", name: "Project Beta" },
    ]);
    readinessCategoryFindMany.mockResolvedValue([
      { id: "cat_1", name: "Catalog Quality" },
    ]);

    prisma = {
      db: {
        user: { count: userCount },
        company: { count: companyCount },
        partnerCompany: { count: partnerCompanyCount },
        project: { count: projectCount, findMany: projectFindMany },
        apartment: { count: apartmentCount },
        analyticsEvent: { groupBy: analyticsGroupBy },
        request: { groupBy: requestGroupBy },
        crmDeal: { groupBy: crmDealGroupBy },
        checkInRecord: { groupBy: checkInGroupBy },
        readinessAssessment: { groupBy: readinessGroupBy },
        readinessScore: { groupBy: readinessScoreGroupBy },
        readinessCategory: { findMany: readinessCategoryFindMany },
      },
    } as unknown as PrismaService;
  });

  it("aggregates admin overview from domain tables and events", async () => {
    const from = new Date("2026-06-18T00:00:00.000Z");
    const to = new Date("2026-07-18T00:00:00.000Z");

    const overview = await loadAdminAnalyticsOverview(prisma, {
      from,
      to,
      fromIso: from.toISOString(),
      toIso: to.toISOString(),
    });

    expect(overview.platformActivity).toEqual({
      totalUsers: 100,
      registeredBuyers: 80,
      activeBuilderCompanies: 12,
      activePartners: 5,
      publishedProjects: 20,
      publishedApartments: 200,
    });
    expect(overview.topProjectsByViews).toEqual([
      { entityId: "proj_a", name: "Project Alpha", viewCount: 50 },
      { entityId: "proj_b", name: "Project Beta", viewCount: 30 },
    ]);
    expect(overview.requests.total).toBe(10);
    expect(overview.dealsByStatus).toEqual([
      { status: "new_request", count: 4 },
      { status: "contacted", count: 2 },
    ]);
    expect(overview.qrScansByContext).toEqual([
      { context: "builder_scan", count: 10 },
    ]);
    expect(overview.checkIns).toEqual({
      allowed: 40,
      duplicate: 5,
      denied: 2,
    });
    expect(overview.readiness.weakestCategories).toEqual([
      {
        categoryId: "cat_1",
        categoryName: "Catalog Quality",
        averageScore: 45,
      },
    ]);
  });
});
