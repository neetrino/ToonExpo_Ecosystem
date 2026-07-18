import { Injectable, Logger } from "@nestjs/common";
import type { HealthResponse } from "@toonexpo/contracts";

import {
  API_PACKAGE_VERSION,
  API_SERVICE_NAME,
  HEALTH_DB_PROBE_SQL,
} from "../common/constants/app.constants.js";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getHealth(): Promise<HealthResponse> {
    const timestamp = new Date().toISOString();
    const dbOk = await this.probeDatabase();

    return {
      status: dbOk ? "ok" : "degraded",
      service: `${API_SERVICE_NAME}@${API_PACKAGE_VERSION}`,
      timestamp,
    };
  }

  private async probeDatabase(): Promise<boolean> {
    try {
      await this.prisma.db.$queryRawUnsafe(HEALTH_DB_PROBE_SQL);
      return true;
    } catch (error: unknown) {
      this.logger.error({ err: error }, "Database health probe failed");
      return false;
    }
  }
}
