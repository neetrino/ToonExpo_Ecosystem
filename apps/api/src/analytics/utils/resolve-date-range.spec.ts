import { describe, expect, it, vi } from "vitest";

import { resolveAnalyticsDateRange } from "./resolve-date-range.js";

describe("resolveAnalyticsDateRange", () => {
  it("defaults to a 30-day window ending now", () => {
    const now = new Date("2026-07-18T12:00:00.000Z");
    vi.setSystemTime(now);

    const range = resolveAnalyticsDateRange({});

    expect(range.to.toISOString()).toBe(now.toISOString());
    expect(range.from.toISOString()).toBe("2026-06-18T12:00:00.000Z");
  });

  it("rejects from after to", () => {
    expect(() =>
      resolveAnalyticsDateRange({
        from: "2026-07-20T00:00:00.000Z",
        to: "2026-07-18T00:00:00.000Z",
      }),
    ).toThrow("from must be before or equal to to");
  });
});
