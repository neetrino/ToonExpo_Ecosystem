import { describe, expect, it } from "vitest";

import {
  formatCatalogPrice,
  formatCompactPrice,
  formatPriceRange,
  isPriceHidden,
} from "./format-price";

describe("isPriceHidden", () => {
  it("hides null and empty amounts", () => {
    expect(isPriceHidden("public", null)).toBe(true);
    expect(isPriceHidden("public", "")).toBe(true);
  });

  it("hides non-public visibility even when amount exists", () => {
    expect(isPriceHidden("by_request", "100")).toBe(true);
    expect(isPriceHidden("hidden", "100")).toBe(true);
    expect(isPriceHidden("visible_after_login", "100")).toBe(true);
  });

  it("shows public amounts", () => {
    expect(isPriceHidden("public", "100")).toBe(false);
  });
});

describe("formatCatalogPrice", () => {
  it("returns on-request label when hidden", () => {
    expect(
      formatCatalogPrice({
        amount: "50000000",
        currency: "AMD",
        locale: "en",
        priceVisibility: "by_request",
        onRequestLabel: "Price on request",
      }),
    ).toBe("Price on request");
  });

  it("formats public AMD amounts", () => {
    const formatted = formatCatalogPrice({
      amount: "61500000",
      currency: "AMD",
      locale: "en",
      priceVisibility: "public",
      onRequestLabel: "Price on request",
    });
    expect(formatted).toContain("61");
    expect(formatted.length).toBeGreaterThan(3);
  });
});

describe("formatCompactPrice", () => {
  it("formats millions with from label", () => {
    expect(
      formatCompactPrice({
        amount: "61500000",
        currency: "AMD",
        locale: "en",
        fromLabel: "from",
        onRequestLabel: "Price on request",
      }),
    ).toBe("from 61.5M AMD");
  });

  it("returns on-request when amount missing", () => {
    expect(
      formatCompactPrice({
        amount: null,
        currency: "AMD",
        locale: "en",
        fromLabel: "from",
        onRequestLabel: "Price on request",
      }),
    ).toBe("Price on request");
  });
});

describe("formatPriceRange", () => {
  it("joins min and max when different", () => {
    const range = formatPriceRange({
      minPrice: "1000",
      maxPrice: "2000",
      currency: "USD",
      locale: "en",
      onRequestLabel: "Price on request",
    });
    expect(range).toContain("–");
  });

  it("returns on-request when both missing", () => {
    expect(
      formatPriceRange({
        minPrice: null,
        maxPrice: null,
        currency: null,
        locale: "en",
        onRequestLabel: "Price on request",
      }),
    ).toBe("Price on request");
  });
});
