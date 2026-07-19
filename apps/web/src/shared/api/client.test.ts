import { describe, expect, it } from "vitest";

import { API_V1_PREFIX, CSRF_COOKIE_NAME } from "@toonexpo/contracts";

import { buildApiUrl } from "./client";
import { isMutatingMethod, readCsrfTokenFromCookie } from "./csrf";

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

  it("returns same-origin relative URLs when base is empty", () => {
    expect(buildApiUrl("/health", "")).toBe(`${API_V1_PREFIX}/health`);
  });
});

describe("csrf helpers", () => {
  it("detects mutating HTTP methods", () => {
    expect(isMutatingMethod("POST")).toBe(true);
    expect(isMutatingMethod("get")).toBe(false);
    expect(isMutatingMethod(undefined)).toBe(false);
  });

  it("returns null for CSRF cookie when document is unavailable", () => {
    expect(readCsrfTokenFromCookie()).toBeNull();
    expect(CSRF_COOKIE_NAME).toBe("toonexpo_csrf");
  });
});
