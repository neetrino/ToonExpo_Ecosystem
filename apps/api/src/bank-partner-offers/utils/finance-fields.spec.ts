import { describe, expect, it } from "vitest";

import {
  normalizeFinanceFields,
  toFinanceFieldsJson,
} from "./finance-fields.js";

describe("normalizeFinanceFields", () => {
  it("accepts localized finance keys and drops empties on serialize", () => {
    const fields = normalizeFinanceFields({
      partnerBank: { hy: "Ամերիա", ru: "", en: "Ameria" },
      paymentTypes: "cash",
    });

    expect(fields.partnerBank).toEqual({
      hy: "Ամերիա",
      ru: "",
      en: "Ameria",
    });
    expect(fields.paymentTypes).toEqual({
      hy: "cash",
      ru: "cash",
      en: "cash",
    });

    const json = toFinanceFieldsJson(fields) as Record<string, unknown>;
    expect(json["partnerBank"]).toEqual({
      hy: "Ամերիա",
      ru: "",
      en: "Ameria",
    });
    expect(json["paymentTypes"]).toEqual({
      hy: "cash",
      ru: "cash",
      en: "cash",
    });
  });

  it("rejects unknown finance keys", () => {
    expect(() => normalizeFinanceFields({ unknown: "x" })).toThrow(
      /Unknown finance field/,
    );
  });
});
