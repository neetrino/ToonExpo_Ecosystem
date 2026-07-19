import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type {
  CompanyMemberListResponse,
  CompanyMemberResponse,
} from "@toonexpo/contracts";
import { CompanyMemberRole, CompanyMemberStatus } from "@toonexpo/db";

import { AccountTypes } from "../auth/decorators/account-types.decorator.js";
import { CurrentUser } from "../auth/decorators/current-user.decorator.js";
import type { AuthenticatedUser } from "../auth/types/authenticated-user.js";
import { CompanyMembersService } from "./company-members.service.js";
import { CompanyAdmin } from "./decorators/company-admin.decorator.js";
import { CompanyMember } from "./decorators/company-member.decorator.js";
import { CurrentCompanyAdmin } from "./decorators/current-company-admin.decorator.js";
import { CurrentCompanyMember } from "./decorators/current-company-member.decorator.js";
import { InviteCompanyMemberDto } from "./dto/invite-company-member.dto.js";
import { ListCompanyMembersQueryDto } from "./dto/list-company-members.query.dto.js";
import { UpdateCompanyMemberDto } from "./dto/update-company-member.dto.js";
import { CompanyAdminGuard } from "./guards/company-admin.guard.js";
import { CompanyMemberGuard } from "./guards/company-member.guard.js";
import type { CompanyAdminContext } from "./types/company-admin-context.js";
import type { CompanyMemberContext } from "./types/company-member-context.js";

@ApiTags("company-members")
@AccountTypes("company_member")
@Controller("company/members")
export class CompanyMembersController {
  constructor(private readonly membersService: CompanyMembersService) {}

  @Get()
  @CompanyMember()
  @UseGuards(CompanyMemberGuard)
  @ApiOperation({ summary: "List members of the caller's company (read-only for members)" })
  @ApiOkResponse({ description: "Paginated company members" })
  list(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @Query() query: ListCompanyMembersQueryDto,
  ): Promise<CompanyMemberListResponse> {
    return this.membersService.list(member.companyId, query.page, query.pageSize);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CompanyAdmin()
  @UseGuards(CompanyAdminGuard)
  @ApiOperation({ summary: "Invite a company member" })
  @ApiCreatedResponse({ description: "Member invited; set-password email sent" })
  invite(
    @CurrentCompanyAdmin() admin: CompanyAdminContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: InviteCompanyMemberDto,
  ): Promise<CompanyMemberResponse> {
    return this.membersService.invite(admin, user.id, {
      name: body.name,
      email: body.email,
      role: body.role as CompanyMemberRole,
      ...(body.phone !== undefined ? { phone: body.phone } : {}),
      ...(body.locale !== undefined ? { locale: body.locale } : {}),
    });
  }

  @Patch(":id")
  @CompanyAdmin()
  @UseGuards(CompanyAdminGuard)
  @ApiOperation({ summary: "Update member role or status" })
  @ApiOkResponse({ description: "Updated membership" })
  update(
    @CurrentCompanyAdmin() admin: CompanyAdminContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() body: UpdateCompanyMemberDto,
  ): Promise<CompanyMemberResponse> {
    return this.membersService.update(admin, user.id, id, {
      ...(body.role !== undefined
        ? { role: body.role as CompanyMemberRole }
        : {}),
      ...(body.status !== undefined
        ? { status: body.status as CompanyMemberStatus }
        : {}),
    });
  }
}
