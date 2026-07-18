import { ConfigService } from "@nestjs/config";
import { describe, expect, it, vi } from "vitest";

import type { AppEnv } from "../config/env.validation.js";
import { ThrottlerConfigService } from "./throttler-config.service.js";
import { UpstashThrottlerStorage } from "./upstash-throttler.storage.js";

const createService = (
  env: Partial<AppEnv>,
): { service: ThrottlerConfigService; logger: { info: ReturnType<typeof vi.fn> } } => {
  const logger = { info: vi.fn(), error: vi.fn() };
  const configService = {
    get: (key: keyof AppEnv) => env[key],
  } as unknown as ConfigService<AppEnv, true>;

  const service = new ThrottlerConfigService(configService, logger as never);
  return { service, logger };
};

describe("ThrottlerConfigService", () => {
  it("uses in-memory storage when Upstash env vars are unset", () => {
    const { service, logger } = createService({});
    const options = service.createThrottlerOptions();

    expect(options.storage).toBeUndefined();
    expect(logger.info).toHaveBeenCalledWith(
      "Rate limiting storage: in-memory (local default)",
    );
  });

  it("uses Upstash Redis storage when both env vars are set", () => {
    vi.stubEnv("VITEST", "");
    const { service, logger } = createService({
      UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
      UPSTASH_REDIS_REST_TOKEN: "token-value",
    });
    const options = service.createThrottlerOptions();

    expect(options.storage).toBeInstanceOf(UpstashThrottlerStorage);
    expect(logger.info).toHaveBeenCalledWith(
      "Rate limiting storage: distributed (Upstash Redis)",
    );
    vi.unstubAllEnvs();
  });
});
