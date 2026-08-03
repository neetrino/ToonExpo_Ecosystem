import {
  Injectable,
  type OnApplicationBootstrap,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPrismaClient, type PrismaClient } from '@toonexpo/db';

import { NODE_ENV_DEVELOPMENT } from '../common/constants/app.constants.js';
import type { AppEnv } from '../config/env.validation.js';
import { NeonIdleConsoleNotifier } from './neon-idle-console.notifier.js';

const NEON_HOST_MARKER = 'neon.tech';

@Injectable()
export class PrismaService implements OnModuleInit, OnApplicationBootstrap, OnModuleDestroy {
  private readonly client: PrismaClient;
  private readonly connectionString: string;
  private readonly idleNotifier: NeonIdleConsoleNotifier | null;

  constructor(configService: ConfigService<AppEnv, true>) {
    this.connectionString = configService.get('DATABASE_URL', {
      infer: true,
    });

    this.idleNotifier =
      process.env['NODE_ENV'] === NODE_ENV_DEVELOPMENT ? new NeonIdleConsoleNotifier() : null;

    // Pool max / connection timeout / statement timeout are fixed in
    // `@toonexpo/db` (`DEFAULT_DB_*`) — not env-configurable.
    this.client = createPrismaClient({
      connectionString: this.connectionString,
      ...(this.idleNotifier !== null
        ? {
            onQueryActivity: () => {
              this.idleNotifier?.noteActivity();
            },
          }
        : {}),
    });
  }

  get db(): PrismaClient {
    return this.client;
  }

  async onModuleInit(): Promise<void> {
    await this.client.$connect();
    this.idleNotifier?.noteActivity();
  }

  onApplicationBootstrap(): void {
    if (process.env['NODE_ENV'] !== NODE_ENV_DEVELOPMENT) {
      return;
    }

    const hostHint = this.connectionString.includes(NEON_HOST_MARKER) ? ' (Neon)' : '';
    console.log(`✓ Database connected successfully${hostHint}`);
  }

  async onModuleDestroy(): Promise<void> {
    this.idleNotifier?.stop();
    await this.client.$disconnect();
  }
}
