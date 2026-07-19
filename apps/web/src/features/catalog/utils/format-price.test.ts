import { describe, expect, it } from "vitest";

import {
  formatCatalogPrice,
  formatCompactPrice,
  formatPriceRange,
  isPriceHidden,
  resolveHiddenPriceLabel,
} from "./format-price";

describe("isPriceHidden", () => {
  it("hides null and empty amounts", () => {
    expect(isPriceHidden("public", null)).toBe(true);
    expect(isPriceHidden("public", "")).toBe(true);
  });

  it("shows amounts the API already revealed (any visibility)", () => {
    expect(isPriceHidden("by_request", "100")).toBe(false);
    expect(isPriceHidden("visible_after_login", "100")).toBe(false);
    expect(isPriceHidden("public", "100")).toBe(false);
  });
});

describe("resolveHiddenPriceLabel", () => {
  it("uses sign-in label for visible_after_login", () => {
    expect(
      resolveHiddenPriceLabel({
        priceVisibility: "visible_after_login",
        onRequestLabel: "Price on request",
        signInLabel: "Sign in to see price",
      }),
    ).toBe("Sign in to see price");
  });

  it("uses on-request for by_request", () => {
    expect(
      resolveHiddenPriceLabel({
        priceVisibility: "by_request",
        onRequestLabel: "Price on request",
        signInLabel: "Sign in to see price",
      }),
    ).toBe("Price on request");
  });
});

describe("formatCatalogPrice", () => {
  it("returns sign-in label when visible_after_login and amount missing", () => {
    expect(
      formatCatalogPrice({
        amount: null,
        currency: "AMD",
        locale: "en",
        priceVisibility: "visible_after_login",
        onRequestLabel: "Price on request",
        signInLabel: "Sign in to see price",
      }),
    ).toBe("Sign in to see price");
  });

  it("returns on-request label when by_request", () => {
    expect(
      formatCatalogPrice({
        amount: null,
        currency: "AMD",
        locale: "en",
        priceVisibility: "by_request",
        onRequestLabel: "Price on request",
        signInLabel: "Sign in to see price",
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
