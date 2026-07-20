import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ThrottlerModuleOptions, ThrottlerOptionsFactory } from '@nestjs/throttler';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import {
  AUTH_RATE_LIMIT_TTL_MS,
  DEFAULT_GLOBAL_RATE_LIMIT,
} from '../common/constants/app.constants.js';
import type { AppEnv } from '../config/env.validation.js';
import { isVitestRuntime } from '../config/test-runtime.js';
import { UpstashThrottlerStorage } from './upstash-throttler.storage.js';

/**
 * Builds {@link ThrottlerModule} options: Upstash Redis when configured, otherwise in-memory.
 */
@Injectable()
export class ThrottlerConfigService implements ThrottlerOptionsFactory {
  private readonly nestLogger = new Logger(ThrottlerConfigService.name);

  constructor(
    private readonly configService: ConfigService<AppEnv, true>,
    @InjectPinoLogger(ThrottlerConfigService.name)
    private readonly pinoLogger: PinoLogger,
  ) {}

  createThrottlerOptions(): ThrottlerModuleOptions {
    const restUrl = this.configService.get('UPSTASH_REDIS_REST_URL', {
      infer: true,
    });
    const restToken = this.configService.get('UPSTASH_REDIS_REST_TOKEN', {
      infer: true,
    });

    const throttlers = [
      {
        name: 'default',
        ttl: AUTH_RATE_LIMIT_TTL_MS,
        limit: DEFAULT_GLOBAL_RATE_LIMIT,
      },
    ];

    const useDistributedStorage = Boolean(restUrl && restToken) && !isVitestRuntime();

    if (useDistributedStorage && restUrl && restToken) {
      this.nestLogger.log('Rate limiting storage: distributed (Upstash Redis)');
      return {
        throttlers,
        storage: new UpstashThrottlerStorage(restUrl, restToken, this.pinoLogger),
      };
    }

    if (restUrl && restToken && isVitestRuntime()) {
      this.nestLogger.log(
        'Rate limiting storage: in-memory (Vitest; shared Redis counters would leak across tests)',
      );
      return { throttlers };
    }

    this.nestLogger.log('Rate limiting storage: in-memory (local default)');
    return { throttlers };
  }
}
