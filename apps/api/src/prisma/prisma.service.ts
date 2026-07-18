import { Injectable, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createPrismaClient, type PrismaClient } from "@toonexpo/db";

import type { AppEnv } from "../config/env.validation.js";

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly client: PrismaClient;

  constructor(configService: ConfigService<AppEnv, true>) {
    const connectionString = configService.get("DATABASE_URL", {
      infer: true,
    });

    this.client = createPrismaClient({ connectionString });
  }

  get db(): PrismaClient {
    return this.client;
  }

  async onModuleInit(): Promise<void> {
    await this.client.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.$disconnect();
  }
}
