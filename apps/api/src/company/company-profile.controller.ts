import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { CompanyProfileResponse } from "@toonexpo/contracts";

import { AccountTypes } from "../auth/decorators/account-types.decorator.js";
import { CompanyProfileService } from "./company-profile.service.js";
import { CompanyAdmin } from "./decorators/company-admin.decorator.js";
import { CompanyMember } from "./decorators/company-member.decorator.js";
import { CurrentCompanyMember } from "./decorators/current-company-member.decorator.js";
import { UpdateCompanyProfileDto } from "./dto/update-company-profile.dto.js";
import { CompanyAdminGuard } from "./guards/company-admin.guard.js";
import { CompanyMemberGuard } from "./guards/company-member.guard.js";
import type { CompanyMemberContext } from "./types/company-member-context.js";

@ApiTags("company-profile")
@AccountTypes("company_member")
@CompanyMember()
@UseGuards(CompanyMemberGuard)
@Controller("company")
export class CompanyProfileController {
  constructor(private readonly profileService: CompanyProfileService) {}

  @Get("me")
  @ApiOperation({ summary: "Get the caller's company profile and role" })
  @ApiOkResponse({ description: "Company profile for the authenticated member" })
  getMe(
    @CurrentCompanyMember() member: CompanyMemberContext,
  ): Promise<CompanyProfileResponse> {
    return this.profileService.getMyCompany(member);
  }

  @Patch("me")
  @CompanyAdmin()
  @UseGuards(CompanyAdminGuard)
  @ApiOperation({ summary: "Update the caller's company profile (company_admin)" })
  @ApiOkResponse({ description: "Updated company profile" })
  updateMe(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @Body() body: UpdateCompanyProfileDto,
  ): Promise<CompanyProfileResponse> {
    return this.profileService.updateMyCompany(member, body);
  }
}
