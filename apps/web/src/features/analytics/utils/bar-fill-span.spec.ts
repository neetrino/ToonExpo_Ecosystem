import { describe, expect, it } from "vitest";

import {
  barFillColSpanClass,
  toBarFillStep,
} from "@/features/analytics/utils/bar-fill-span";

describe("barFillColSpanClass", () => {
  it("returns null for zero values", () => {
    expect(barFillColSpanClass(0, 10)).toBeNull();
    expect(barFillColSpanClass(3, 0)).toBeNull();
  });

  it("maps ratios into fixed col-span classes", () => {
    expect(toBarFillStep(5, 10)).toBe(5);
    expect(barFillColSpanClass(5, 10)).toBe("col-span-5");
    expect(barFillColSpanClass(10, 10)).toBe("col-span-10");
  });
});
