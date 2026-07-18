import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type {
  ThrottlerModuleOptions,
  ThrottlerOptionsFactory,
} from "@nestjs/throttler";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

import {
  AUTH_RATE_LIMIT_LIMIT,
  AUTH_RATE_LIMIT_TTL_MS,
} from "../common/constants/app.constants.js";
import type { AppEnv } from "../config/env.validation.js";
import { UpstashThrottlerStorage } from "./upstash-throttler.storage.js";

/**
 * Builds {@link ThrottlerModule} options: Upstash Redis when configured, otherwise in-memory.
 */
@Injectable()
export class ThrottlerConfigService implements ThrottlerOptionsFactory {
  constructor(
    private readonly configService: ConfigService<AppEnv, true>,
    @InjectPinoLogger(ThrottlerConfigService.name)
    private readonly logger: PinoLogger,
  ) {}

  createThrottlerOptions(): ThrottlerModuleOptions {
    const restUrl = this.configService.get("UPSTASH_REDIS_REST_URL", {
      infer: true,
    });
    const restToken = this.configService.get("UPSTASH_REDIS_REST_TOKEN", {
      infer: true,
    });

    const throttlers = [
      {
        name: "default",
        ttl: AUTH_RATE_LIMIT_TTL_MS,
        limit: AUTH_RATE_LIMIT_LIMIT * 10,
      },
    ];

    const useDistributedStorage =
      Boolean(restUrl && restToken) && process.env["VITEST"] !== "true";

    if (useDistributedStorage && restUrl && restToken) {
      this.logger.info(
        "Rate limiting storage: distributed (Upstash Redis)",
      );
      return {
        throttlers,
        storage: new UpstashThrottlerStorage(restUrl, restToken, this.logger),
      };
    }

    if (restUrl && restToken && process.env["VITEST"] === "true") {
      this.logger.info(
        "Rate limiting storage: in-memory (Vitest; shared Redis counters would leak across tests)",
      );
      return { throttlers };
    }

    this.logger.info("Rate limiting storage: in-memory (local default)");
    return { throttlers };
  }
}
