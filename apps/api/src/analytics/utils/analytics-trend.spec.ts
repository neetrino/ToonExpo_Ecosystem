import { describe, expect, it } from "vitest";

import {
  countByUtcDay,
  enumerateUtcDayKeys,
  percentChange,
  previousAnalyticsDateRange,
  toTrendMetric,
  toUtcDayKey,
} from "./analytics-trend.js";

describe("analytics-trend utils", () => {
  it("computes previous equal-length window ending at range.from", () => {
    const from = new Date("2026-07-11T00:00:00.000Z");
    const to = new Date("2026-08-10T00:00:00.000Z");
    const previous = previousAnalyticsDateRange({
      from,
      to,
      fromIso: from.toISOString(),
      toIso: to.toISOString(),
    });

    expect(previous.to.toISOString()).toBe(from.toISOString());
    expect(previous.from.toISOString()).toBe("2026-06-11T00:00:00.000Z");
  });

  it("computes percent change with one decimal", () => {
    expect(percentChange(57, 50)).toBe(14);
    expect(percentChange(48, 44)).toBe(9.1);
    expect(percentChange(0, 0)).toBe(0);
    expect(percentChange(5, 0)).toBeNull();
  });

  it("builds trend metrics", () => {
    expect(toTrendMetric(57, 50)).toEqual({ value: 57, changePercent: 14 });
  });

  it("enumerates utc day keys inclusively", () => {
    const from = new Date("2026-07-11T15:00:00.000Z");
    const to = new Date("2026-07-13T02:00:00.000Z");
    expect(
      enumerateUtcDayKeys({
        from,
        to,
        fromIso: from.toISOString(),
        toIso: to.toISOString(),
      }),
    ).toEqual(["2026-07-11", "2026-07-12", "2026-07-13"]);
  });

  it("buckets dates by utc day", () => {
    const counts = countByUtcDay([
      new Date("2026-07-11T01:00:00.000Z"),
      new Date("2026-07-11T23:00:00.000Z"),
      new Date("2026-07-12T00:00:00.000Z"),
    ]);
    expect(counts.get(toUtcDayKey(new Date("2026-07-11T00:00:00.000Z")))).toBe(2);
    expect(counts.get("2026-07-12")).toBe(1);
  });
});
