import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PrismaService } from "../prisma/prisma.service.js";
import { AnalyticsService } from "./analytics.service.js";

describe("AnalyticsService", () => {
  const create = vi.fn();
  const logger = { error: vi.fn() };
  let service: AnalyticsService;

  beforeEach(() => {
    vi.clearAllMocks();
    const prisma = {
      db: { analyticsEvent: { create } },
    } as unknown as PrismaService;
    service = new AnalyticsService(prisma, logger as never);
  });

  it("does not throw when persistence fails", async () => {
    create.mockRejectedValue(new Error("db unavailable"));

    expect(() => {
      service.track({ eventType: "project_view", projectId: "proj_1" });
    }).not.toThrow();

    await vi.waitFor(() => {
      expect(logger.error).toHaveBeenCalled();
    });
  });

  it("tracks qr_scanned with ids only, not buyer contact fields", async () => {
    create.mockResolvedValue({ id: "evt_2" });

    service.track({
      eventType: "qr_scanned",
      source: "builder_scan",
      companyId: "co_1",
      metadata: { scanEventId: "scan_1", buyerProfileId: "bp_1" },
    });

    await vi.waitFor(() => {
      expect(create).toHaveBeenCalled();
    });

    const serialized = JSON.stringify(create.mock.calls[0]?.[0]?.data);
    expect(serialized).toContain("bp_1");
    expect(serialized).not.toMatch(/@/);
  });
});
