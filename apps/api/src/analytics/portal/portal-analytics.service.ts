import { Injectable } from "@nestjs/common";
import type { PortalAnalyticsOverview } from "@toonexpo/contracts";

import type { CompanyMemberContext } from "../../company/types/company-member-context.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import type { AnalyticsDateRangeQueryDto } from "../dto/analytics-date-range.query.dto.js";
import { resolveAnalyticsDateRange } from "../utils/resolve-date-range.js";
import { loadPortalAnalyticsOverview } from "./portal-analytics-aggregates.js";

@Injectable()
export class PortalAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  getOverview(
    member: CompanyMemberContext,
    query: AnalyticsDateRangeQueryDto,
  ): Promise<PortalAnalyticsOverview> {
    const range = resolveAnalyticsDateRange(query);
    return loadPortalAnalyticsOverview(this.prisma, member.companyId, range);
  }
}
