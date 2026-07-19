import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { PortalServiceProviderListResponse } from "@toonexpo/contracts";

import { AccountTypes } from "../../auth/decorators/account-types.decorator.js";
import { CompanyMember } from "../../company/decorators/company-member.decorator.js";
import { CompanyMemberGuard } from "../../company/guards/company-member.guard.js";
import { ListPortalServiceProvidersQueryDto } from "../admin/dto/service-provider.dto.js";
import { PortalServiceProvidersService } from "./portal-service-providers.service.js";

@ApiTags("portal-service-providers")
@AccountTypes("company_member")
@CompanyMember()
@UseGuards(CompanyMemberGuard)
@Controller("portal/service-providers")
export class PortalServiceProvidersController {
  constructor(private readonly providers: PortalServiceProvidersService) {}

  @Get()
  @ApiOperation({ summary: "List active service providers for a category" })
  @ApiOkResponse({ description: "Active providers in category" })
  list(
    @Query() query: ListPortalServiceProvidersQueryDto,
  ): Promise<PortalServiceProviderListResponse> {
    return this.providers.listByCategory(query);
  }
}
