import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { prisma, type PrismaClient } from '@toonexpo/db';

/** Disconnect Prisma when there are no queries for this long. */
export const DATABASE_IDLE_TIMEOUT_MS = 5 * 60 * 1000;

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('Database');
  private readonly idleTimeoutMs = DATABASE_IDLE_TIMEOUT_MS;
  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private activityGeneration = 0;
  private connected = false;
  private connectPromise: Promise<void> | null = null;
  private disconnectPromise: Promise<void> | null = null;

  readonly client: PrismaClient;

  constructor() {
    this.client = prisma.$extends({
      query: {
        $allOperations: async ({ args, query }) => {
          await this.ensureConnected();
          this.scheduleIdleDisconnect();
          return query(args);
        },
      },
    }) as unknown as PrismaClient;
  }

  async onModuleInit(): Promise<void> {
    await this.ensureConnected();
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect('shutdown');
  }

  private async ensureConnected(): Promise<void> {
    if (this.disconnectPromise) {
      await this.disconnectPromise;
    }
    if (this.connected) {
      return;
    }
    if (this.connectPromise) {
      await this.connectPromise;
      return;
    }

    this.connectPromise = this.connect();
    try {
      await this.connectPromise;
    } finally {
      this.connectPromise = null;
    }
  }

  private async connect(): Promise<void> {
    const startedAt = Date.now();
    try {
      await prisma.$connect();
    } catch (error) {
      this.connected = false;
      this.logger.error(
        `Connection failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
    this.connected = true;
    this.logger.log(`Connected successfully (${Date.now() - startedAt}ms)`);
    this.scheduleIdleDisconnect();
  }

  private async disconnect(reason: 'idle' | 'shutdown'): Promise<void> {
    this.clearIdleTimer();
    if (!this.connected) {
      return;
    }
    if (this.disconnectPromise) {
      await this.disconnectPromise;
      return;
    }

    this.disconnectPromise = this.runDisconnect(reason);
    try {
      await this.disconnectPromise;
    } finally {
      this.disconnectPromise = null;
    }
  }

  private async runDisconnect(reason: 'idle' | 'shutdown'): Promise<void> {
    await prisma.$disconnect();
    this.connected = false;
    if (reason === 'idle') {
      this.logger.error(`Disconnected (idle ${formatIdleDuration(this.idleTimeoutMs)})`);
      return;
    }
    this.logger.error('Disconnected (shutdown)');
  }

  private scheduleIdleDisconnect(): void {
    this.clearIdleTimer();
    const generation = ++this.activityGeneration;
    this.idleTimer = setTimeout(() => {
      if (generation !== this.activityGeneration) {
        return;
      }
      void this.disconnect('idle');
    }, this.idleTimeoutMs);
    this.idleTimer.unref();
  }

  private clearIdleTimer(): void {
    if (!this.idleTimer) {
      return;
    }
    clearTimeout(this.idleTimer);
    this.idleTimer = null;
  }
}

function formatIdleDuration(ms: number): string {
  if (ms % 60_000 === 0) {
    return `${ms / 60_000}m`;
  }
  if (ms % 1000 === 0) {
    return `${ms / 1000}s`;
  }
  return `${ms}ms`;
}
