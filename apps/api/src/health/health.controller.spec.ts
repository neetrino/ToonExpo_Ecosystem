import { beforeEach, describe, expect, it, vi } from "vitest";
import type { HealthResponse } from "@toonexpo/contracts";

import { HealthController } from "./health.controller.js";
import type { HealthService } from "./health.service.js";

describe("HealthController", () => {
  const getHealth = vi.fn();
  let controller: HealthController;

  beforeEach(() => {
    getHealth.mockReset();
    const healthService = { getHealth } as unknown as HealthService;
    controller = new HealthController(healthService);
  });

  it("returns health payload from HealthService", async () => {
    const payload: HealthResponse = {
      status: "ok",
      service: "toonexpo-api@0.0.0",
      timestamp: "2026-07-18T00:00:00.000Z",
    };
    getHealth.mockResolvedValue(payload);

    await expect(controller.getHealth()).resolves.toEqual(payload);
    expect(getHealth).toHaveBeenCalledOnce();
  });
});
