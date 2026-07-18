import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { PortalAnalyticsOverview } from "@toonexpo/contracts";

import { AccountTypes } from "../../auth/decorators/account-types.decorator.js";
import { CompanyMember } from "../../company/decorators/company-member.decorator.js";
import { CurrentCompanyMember } from "../../company/decorators/current-company-member.decorator.js";
import { CompanyMemberGuard } from "../../company/guards/company-member.guard.js";
import type { CompanyMemberContext } from "../../company/types/company-member-context.js";
import { AnalyticsDateRangeQueryDto } from "../dto/analytics-date-range.query.dto.js";
import { PortalAnalyticsService } from "./portal-analytics.service.js";

@ApiTags("portal-analytics")
@AccountTypes("company_member")
@CompanyMember({ builderOnly: true })
@UseGuards(CompanyMemberGuard)
@Controller("portal/analytics")
export class PortalAnalyticsController {
  constructor(private readonly analytics: PortalAnalyticsService) {}

  @Get("overview")
  @ApiOperation({ summary: "Builder company analytics overview" })
  @ApiOkResponse({ description: "Company-scoped analytics dashboard summary" })
  getOverview(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @Query() query: AnalyticsDateRangeQueryDto,
  ): Promise<PortalAnalyticsOverview> {
    return this.analytics.getOverview(member, query);
  }
}
