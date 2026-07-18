import { describe, expect, it } from "vitest";

import {
  PROJECT_PAGE_SIZE,
  buildProjectSearchParams,
  parseProjectFilters,
  toListProjectsQuery,
} from "./project-filters";

describe("parseProjectFilters", () => {
  it("applies defaults", () => {
    expect(parseProjectFilters({})).toEqual({
      page: 1,
      pageSize: PROJECT_PAGE_SIZE,
    });
  });

  it("parses valid filter values", () => {
    expect(
      parseProjectFilters({
        page: "2",
        rooms: "3",
        minPrice: "10000000",
        maxPrice: "90000000",
        salesStatus: "available",
        city: "Yerevan",
        builderId: "seed_company_glendale",
      }),
    ).toEqual({
      page: 2,
      pageSize: PROJECT_PAGE_SIZE,
      rooms: 3,
      minPrice: 10_000_000,
      maxPrice: 90_000_000,
      salesStatus: "available",
      city: "Yerevan",
      builderId: "seed_company_glendale",
    });
  });

  it("ignores invalid salesStatus and non-positive numbers", () => {
    expect(
      parseProjectFilters({
        page: "0",
        rooms: "-1",
        salesStatus: "pending",
        minPrice: "abc",
      }),
    ).toEqual({
      page: 1,
      pageSize: PROJECT_PAGE_SIZE,
    });
  });

  it("reads first value from array search params", () => {
    expect(parseProjectFilters({ city: ["Yerevan", "Gyumri"] }).city).toBe(
      "Yerevan",
    );
  });
});

describe("toListProjectsQuery", () => {
  it("maps filters to API query", () => {
    expect(
      toListProjectsQuery({
        page: 1,
        pageSize: 12,
        rooms: 2,
        salesStatus: "reserved",
      }),
    ).toEqual({
      page: 1,
      pageSize: 12,
      rooms: 2,
      salesStatus: "reserved",
    });
  });
});

describe("buildProjectSearchParams", () => {
  it("omits default page and pageSize", () => {
    expect(
      buildProjectSearchParams({
        page: 1,
        pageSize: PROJECT_PAGE_SIZE,
        city: "Yerevan",
      }),
    ).toEqual({ city: "Yerevan" });
  });

  it("supports page override for pagination links", () => {
    expect(
      buildProjectSearchParams(
        { page: 1, pageSize: PROJECT_PAGE_SIZE, rooms: 2 },
        3,
      ),
    ).toEqual({ page: "3", rooms: "2" });
  });
});
