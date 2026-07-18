import { describe, expect, it } from "vitest";

import { isBuyerAccount, isNonBuyerStaff } from "./is-buyer-account";

describe("isBuyerAccount", () => {
  it("returns true for buyer", () => {
    expect(isBuyerAccount({ accountType: "buyer" })).toBe(true);
  });

  it("returns false for other types and null", () => {
    expect(isBuyerAccount({ accountType: "company_member" })).toBe(false);
    expect(isBuyerAccount(null)).toBe(false);
    expect(isBuyerAccount(undefined)).toBe(false);
  });
});

describe("isNonBuyerStaff", () => {
  it("flags staff account types", () => {
    expect(isNonBuyerStaff("company_member")).toBe(true);
    expect(isNonBuyerStaff("platform_admin")).toBe(true);
    expect(isNonBuyerStaff("entrance_staff")).toBe(true);
    expect(isNonBuyerStaff("buyer")).toBe(false);
    expect(isNonBuyerStaff(undefined)).toBe(false);
  });
});
