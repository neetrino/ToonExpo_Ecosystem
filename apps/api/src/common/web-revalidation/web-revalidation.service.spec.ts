import { beforeEach, describe, expect, it, vi } from "vitest";

import { WEB_REVALIDATE_SECRET_HEADER } from "../constants/app.constants.js";
import { WebRevalidationService } from "./web-revalidation.service.js";

const createConfig = (values: {
  WEB_REVALIDATE_URL?: string;
  WEB_REVALIDATE_SECRET?: string;
}) => ({
  get: vi.fn((key: string) => values[key as keyof typeof values]),
});

describe("WebRevalidationService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("no-ops with debug when env is unset", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const service = new WebRevalidationService(
      createConfig({}) as never,
    );
    const debugSpy = vi.spyOn(service["logger"], "debug");

    service.revalidateCatalog("proj-1");
    await vi.waitFor(() => {
      expect(debugSpy).toHaveBeenCalled();
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("POSTs tags with secret header when configured", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    const service = new WebRevalidationService(
      createConfig({
        WEB_REVALIDATE_URL: "http://localhost:3000/api/revalidate",
        WEB_REVALIDATE_SECRET: "test-secret-at-least-32-chars-long!!",
      }) as never,
    );

    service.revalidatePartners();
    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    const [url, init] = fetchMock.mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(url).toBe("http://localhost:3000/api/revalidate");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({
      "Content-Type": "application/json",
      [WEB_REVALIDATE_SECRET_HEADER]: "test-secret-at-least-32-chars-long!!",
    });
    expect(JSON.parse(String(init.body))).toEqual({ tags: ["partners"] });
  });

  it("logs warning and does not throw when fetch fails", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("network down"));
    vi.stubGlobal("fetch", fetchMock);

    const service = new WebRevalidationService(
      createConfig({
        WEB_REVALIDATE_URL: "http://localhost:3000/api/revalidate",
        WEB_REVALIDATE_SECRET: "test-secret-at-least-32-chars-long!!",
      }) as never,
    );
    const warnSpy = vi.spyOn(service["logger"], "warn");

    expect(() => service.revalidateExhibition()).not.toThrow();
    await vi.waitFor(() => {
      expect(warnSpy).toHaveBeenCalled();
    });
  });
});
