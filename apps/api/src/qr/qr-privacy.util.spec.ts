import { describe, expect, it } from "vitest";

import { maskEmail, maskPhone } from "./qr-privacy.util.js";

describe("qr-privacy", () => {
  it("masks phone keeping prefix and last digits", () => {
    expect(maskPhone("+37491111222")).toBe("+374******22");
  });

  it("masks short phones fully", () => {
    expect(maskPhone("1234")).toBe("****");
  });

  it("masks email local part", () => {
    expect(maskEmail("Ani.Buyer@Example.com")).toBe("a***@example.com");
  });
});
