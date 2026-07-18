import { describe, expect, it } from "vitest";

import { API_V1_PREFIX } from "@toonexpo/contracts";

import { buildApiUrl } from "./client";

describe("buildApiUrl", () => {
  it("joins origin, API v1 prefix and path", () => {
    expect(buildApiUrl("/health", "http://localhost:4000")).toBe(
      `http://localhost:4000${API_V1_PREFIX}/health`,
    );
  });

  it("normalizes missing leading slash and trailing origin slash", () => {
    expect(buildApiUrl("health", "http://localhost:4000/")).toBe(
      `http://localhost:4000${API_V1_PREFIX}/health`,
    );
  });
});
