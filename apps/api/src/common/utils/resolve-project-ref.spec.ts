import { describe, expect, it } from "vitest";

import { normalizeProjectRef } from "./resolve-project-ref.js";

describe("normalizeProjectRef", () => {
  it("leaves a decoded unicode slug unchanged", () => {
    expect(normalizeProjectRef("տեստ")).toBe("տեստ");
  });

  it("decodes percent-encoded and double-encoded slugs", () => {
    expect(normalizeProjectRef(encodeURIComponent("տեստ"))).toBe("տեստ");
    expect(
      normalizeProjectRef(encodeURIComponent(encodeURIComponent("տեստ"))),
    ).toBe("տեստ");
    expect(normalizeProjectRef("Davinchi%2520_Clubhouse_view")).toBe(
      "Davinchi _Clubhouse_view",
    );
  });
});
