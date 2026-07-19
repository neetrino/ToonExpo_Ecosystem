import { describe, expect, it } from "vitest";

import { sanitizeReturnUrl } from "./sanitize-return-url";

describe("sanitizeReturnUrl", () => {
  it("accepts relative app paths", () => {
    expect(sanitizeReturnUrl("/profile/qr")).toBe("/profile/qr");
    expect(sanitizeReturnUrl("/projects/abc")).toBe("/projects/abc");
  });

  it("rejects open redirects", () => {
    expect(sanitizeReturnUrl("//evil.com")).toBe("/profile");
    expect(sanitizeReturnUrl("https://evil.com")).toBe("/profile");
    expect(sanitizeReturnUrl("/\\evil")).toBe("/profile");
  });

  it("uses fallback for empty values", () => {
    expect(sanitizeReturnUrl(null, "/projects")).toBe("/projects");
    expect(sanitizeReturnUrl(undefined)).toBe("/profile");
  });
});
