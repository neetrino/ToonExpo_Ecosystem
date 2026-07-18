import { describe, expect, it } from "vitest";

import { formatBuyerDateTime } from "./format-datetime";

describe("formatBuyerDateTime", () => {
  it("formats a valid ISO timestamp", () => {
    const result = formatBuyerDateTime("2026-07-18T12:00:00.000Z", "en");
    expect(result.length).toBeGreaterThan(0);
    expect(result).not.toBe("2026-07-18T12:00:00.000Z");
  });

  it("returns the raw string for invalid input", () => {
    expect(formatBuyerDateTime("not-a-date", "en")).toBe("not-a-date");
  });
});
