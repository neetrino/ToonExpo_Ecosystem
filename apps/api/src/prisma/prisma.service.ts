import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createPrismaClient,
  DEFAULT_DB_KEEPALIVE_INTERVAL_MS,
  type PrismaClient,
} from '@toonexpo/db';

import {
  HEALTH_DB_PROBE_SQL,
  NODE_ENV_DEVELOPMENT,
  NODE_ENV_TEST,
} from '../common/constants/app.constants.js';
import type { AppEnv } from '../config/env.validation.js';

const NEON_HOST_MARKER = 'neon.tech';

@Injectable()
export class PrismaService implements OnModuleInit, OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly client: PrismaClient;
  private readonly connectionString: string;
  private keepaliveTimer: ReturnType<typeof setInterval> | null = null;

  constructor(configService: ConfigService<AppEnv, true>) {
    this.connectionString = configService.get('DATABASE_URL', {
      infer: true,
    });

    // Pool max / connection timeout / statement timeout are fixed in
    // `@toonexpo/db` (`DEFAULT_DB_*`) — not env-configurable.
    this.client = createPrismaClient({ connectionString: this.connectionString });
  }

  get db(): PrismaClient {
    return this.client;
  }

  async onModuleInit(): Promise<void> {
    await this.client.$connect();
    this.startKeepalive();
  }

  onApplicationBootstrap(): void {
    if (process.env['NODE_ENV'] !== NODE_ENV_DEVELOPMENT) {
      return;
    }

    const hostHint = this.connectionString.includes(NEON_HOST_MARKER) ? ' (Neon)' : '';
    // eslint-disable-next-line no-console -- intentional local startup banner
    console.log(`✓ Database connected successfully${hostHint}`);
  }

  async onModuleDestroy(): Promise<void> {
    this.stopKeepalive();
    await this.client.$disconnect();
  }

  private startKeepalive(): void {
    if (process.env['NODE_ENV'] === NODE_ENV_TEST) {
      return;
    }

    this.keepaliveTimer = setInterval(() => {
      void this.pingDatabase();
    }, DEFAULT_DB_KEEPALIVE_INTERVAL_MS);
    // Do not block process exit solely for this timer (tests / short CLI).
    this.keepaliveTimer.unref();
  }

  private stopKeepalive(): void {
    if (this.keepaliveTimer === null) {
      return;
    }

    clearInterval(this.keepaliveTimer);
    this.keepaliveTimer = null;
  }

  private async pingDatabase(): Promise<void> {
    try {
      await this.client.$queryRawUnsafe(HEALTH_DB_PROBE_SQL);
    } catch (error: unknown) {
      this.logger.warn(
        { err: error },
        'Database keepalive ping failed (Neon may be waking or unreachable)',
      );
    }
  }
}
