import { Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { AdminAnalyticsOverview } from "@toonexpo/contracts";

import { AccountTypes } from "../../auth/decorators/account-types.decorator.js";
import { AnalyticsDateRangeQueryDto } from "../dto/analytics-date-range.query.dto.js";
import { AdminAnalyticsService } from "./admin-analytics.service.js";

@ApiTags("admin-analytics")
@AccountTypes("platform_admin")
@Controller("admin/analytics")
export class AdminAnalyticsController {
  constructor(private readonly analytics: AdminAnalyticsService) {}

  @Get("overview")
  @ApiOperation({ summary: "Global platform analytics overview" })
  @ApiOkResponse({ description: "Admin analytics dashboard summary" })
  getOverview(
    @Query() query: AnalyticsDateRangeQueryDto,
  ): Promise<AdminAnalyticsOverview> {
    return this.analytics.getOverview(query);
  }
}
