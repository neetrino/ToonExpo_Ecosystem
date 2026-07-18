import { UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BOS_API_KEY_HEADER } from "../../common/constants/app.constants.js";
import { BosApiKeyGuard } from "./bos-api-key.guard.js";

describe("BosApiKeyGuard", () => {
  const get = vi.fn();
  let guard: BosApiKeyGuard;

  beforeEach(() => {
    vi.clearAllMocks();
    guard = new BosApiKeyGuard({ get } as unknown as ConfigService);
  });

  it("rejects when BOS_API_KEY is unset", () => {
    get.mockReturnValue(undefined);

    expect(() =>
      guard.canActivate({
        switchToHttp: () => ({
          getRequest: () => ({
            headers: { [BOS_API_KEY_HEADER]: "test-key" },
          }),
        }),
      } as never),
    ).toThrow(/disabled/i);
  });

  it("rejects wrong API key", () => {
    get.mockReturnValue("expected-secret-key-12345678901234567890");

    expect(() =>
      guard.canActivate({
        switchToHttp: () => ({
          getRequest: () => ({
            headers: { [BOS_API_KEY_HEADER]: "wrong-key" },
          }),
        }),
      } as never),
    ).toThrow(UnauthorizedException);
  });

  it("accepts matching API key", () => {
    const key = "expected-secret-key-12345678901234567890";
    get.mockReturnValue(key);

    const result = guard.canActivate({
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { [BOS_API_KEY_HEADER]: key },
        }),
      }),
    } as never);

    expect(result).toBe(true);
  });
});
