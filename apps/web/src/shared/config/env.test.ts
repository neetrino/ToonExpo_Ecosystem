import { afterEach, describe, expect, it } from "vitest";

import {
  getPublicEnv,
  getServerApiBaseUrl,
  isApiProxyEnabled,
} from "./env";

const ENV_KEYS = [
  "NEXT_PUBLIC_API_URL",
  "API_URL",
  "API_PROXY_TARGET",
] as const;

const originalEnv = (): Record<string, string | undefined> =>
  Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

const restoreEnv = (snapshot: Record<string, string | undefined>): void => {
  for (const key of ENV_KEYS) {
    const value = snapshot[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
};

describe("env resolution", () => {
  afterEach(() => {
    restoreEnv(originalEnv());
  });

  it("uses direct public URL when NEXT_PUBLIC_API_URL is set", () => {
    process.env["NEXT_PUBLIC_API_URL"] = "https://api.example.com";
    delete process.env["API_PROXY_TARGET"];

    expect(getPublicEnv()).toEqual({ apiBaseUrl: "https://api.example.com" });
    expect(getServerApiBaseUrl()).toBe("https://api.example.com");
    expect(isApiProxyEnabled()).toBe(false);
  });

  it("uses same-origin relative URLs when proxy target is set without public URL", () => {
    delete process.env["NEXT_PUBLIC_API_URL"];
    process.env["API_PROXY_TARGET"] = "https://api-internal.run.app";

    expect(getPublicEnv()).toEqual({ apiBaseUrl: "" });
    expect(getServerApiBaseUrl()).toBe("https://api-internal.run.app");
    expect(isApiProxyEnabled()).toBe(true);
  });

  it("prefers NEXT_PUBLIC_API_URL over proxy target for server-side fetch", () => {
    process.env["NEXT_PUBLIC_API_URL"] = "https://api.toonexpo.com";
    process.env["API_PROXY_TARGET"] = "https://legacy.run.app";

    expect(getPublicEnv()).toEqual({ apiBaseUrl: "https://api.toonexpo.com" });
    expect(getServerApiBaseUrl()).toBe("https://api.toonexpo.com");
  });
});
