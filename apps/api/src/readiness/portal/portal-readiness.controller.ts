import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { PortalReadinessResponse } from "@toonexpo/contracts";

import { AccountTypes } from "../../auth/decorators/account-types.decorator.js";
import { CompanyMember } from "../../company/decorators/company-member.decorator.js";
import { CurrentCompanyMember } from "../../company/decorators/current-company-member.decorator.js";
import { CompanyMemberGuard } from "../../company/guards/company-member.guard.js";
import type { CompanyMemberContext } from "../../company/types/company-member-context.js";
import { PortalReadinessService } from "./portal-readiness.service.js";

@ApiTags("portal-readiness")
@AccountTypes("company_member")
@CompanyMember({ builderOnly: true })
@UseGuards(CompanyMemberGuard)
@Controller("portal/readiness")
export class PortalReadinessController {
  constructor(private readonly readiness: PortalReadinessService) {}

  @Get()
  @ApiOperation({ summary: "Get active readiness assessments for the builder company" })
  @ApiOkResponse({ description: "Builder-visible readiness summary" })
  get(
    @CurrentCompanyMember() member: CompanyMemberContext,
  ): Promise<PortalReadinessResponse> {
    return this.readiness.getCompanyReadiness(member);
  }
}
