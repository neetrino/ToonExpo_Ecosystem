import { describe, expect, it } from "vitest";
import type { CrmDealListItem } from "@toonexpo/contracts";

import { aggregateCrmDashboardStats } from "./crm-dashboard-stats";

const deal = (
  overrides: Partial<CrmDealListItem> & Pick<CrmDealListItem, "id" | "status">,
): CrmDealListItem => ({
  source: "manual_builder_entry",
  projectId: null,
  projectName: null,
  buyer: {
    buyerProfileId: null,
    name: "A",
    phone: null,
    email: null,
  },
  assignedUserId: null,
  assignedUserName: null,
  lastActivityAt: null,
  nextFollowUpAt: null,
  createdAt: "2026-07-18T10:00:00.000Z",
  updatedAt: "2026-07-18T10:00:00.000Z",
  ...overrides,
});

describe("aggregateCrmDashboardStats", () => {
  it("counts open deals by status and today creations", () => {
    const now = new Date("2026-07-18T15:00:00.000Z");
    const stats = aggregateCrmDashboardStats(
      [
        deal({ id: "1", status: "new_request" }),
        deal({ id: "2", status: "contacted" }),
        deal({ id: "3", status: "lost", createdAt: "2026-07-17T10:00:00.000Z" }),
        deal({ id: "4", status: "converted" }),
      ],
      now,
    );

    expect(stats.openTotal).toBe(2);
    expect(stats.openByStatus.new_request).toBe(1);
    expect(stats.openByStatus.contacted).toBe(1);
    expect(stats.createdToday).toBe(3);
  });
});
