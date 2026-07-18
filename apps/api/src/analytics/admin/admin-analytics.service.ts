import { Injectable } from "@nestjs/common";
import type { AdminAnalyticsOverview } from "@toonexpo/contracts";

import { PrismaService } from "../../prisma/prisma.service.js";
import type { AnalyticsDateRangeQueryDto } from "../dto/analytics-date-range.query.dto.js";
import { resolveAnalyticsDateRange } from "../utils/resolve-date-range.js";
import { loadAdminAnalyticsOverview } from "./admin-analytics-aggregates.js";

@Injectable()
export class AdminAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  getOverview(query: AnalyticsDateRangeQueryDto): Promise<AdminAnalyticsOverview> {
    const range = resolveAnalyticsDateRange(query);
    return loadAdminAnalyticsOverview(this.prisma, range);
  }
}
