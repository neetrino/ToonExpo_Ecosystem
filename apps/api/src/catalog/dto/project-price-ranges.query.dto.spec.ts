import { BadRequestException } from "@nestjs/common";
import { describe, expect, it } from "vitest";

import { CATALOG_PRICES_MAX_PROJECT_IDS } from "../catalog.constants.js";
import { parseProjectPriceRangeIds } from "./project-price-ranges.query.dto.js";

describe("parseProjectPriceRangeIds", () => {
  it("parses, trims and deduplicates comma-separated ids", () => {
    expect(parseProjectPriceRangeIds("a, b ,a,,c")).toEqual(["a", "b", "c"]);
  });

  it("rejects an empty list", () => {
    expect(() => parseProjectPriceRangeIds(" , ")).toThrow(BadRequestException);
  });

  it("rejects batches above the cap", () => {
    const ids = Array.from(
      { length: CATALOG_PRICES_MAX_PROJECT_IDS + 1 },
      (_item, index) => `proj_${index}`,
    ).join(",");

    expect(() => parseProjectPriceRangeIds(ids)).toThrow(BadRequestException);
  });
});
