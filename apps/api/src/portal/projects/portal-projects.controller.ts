import {
  Body,
  Controller,
  Delete,
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
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type {
  PortalProjectDetail,
  PortalProjectListResponse,
  ProjectQrResponse,
} from "@toonexpo/contracts";

import { AccountTypes } from "../../auth/decorators/account-types.decorator.js";
import { CurrentUser } from "../../auth/decorators/current-user.decorator.js";
import type { AuthenticatedUser } from "../../auth/types/authenticated-user.js";
import { CompanyMember } from "../../company/decorators/company-member.decorator.js";
import { CurrentCompanyMember } from "../../company/decorators/current-company-member.decorator.js";
import { CompanyMemberGuard } from "../../company/guards/company-member.guard.js";
import type { CompanyMemberContext } from "../../company/types/company-member-context.js";
import { CreatePortalProjectDto } from "../dto/create-portal-project.dto.js";
import { ListPortalProjectsQueryDto } from "../dto/list-portal-projects.query.dto.js";
import { UpdatePortalProjectDto } from "../dto/update-portal-project.dto.js";
import { UpdatePortalPublicationDto } from "../dto/update-portal-publication.dto.js";
import { PortalProjectQrService } from "./portal-project-qr.service.js";
import { PortalProjectsService } from "./portal-projects.service.js";

@ApiTags("portal-projects")
@AccountTypes("company_member")
@CompanyMember({ builderOnly: true })
@UseGuards(CompanyMemberGuard)
@Controller("portal/projects")
export class PortalProjectsController {
  constructor(
    private readonly projectsService: PortalProjectsService,
    private readonly projectQrService: PortalProjectQrService,
  ) {}

  @Get()
  @ApiOperation({ summary: "List company projects (including drafts)" })
  @ApiOkResponse({ description: "Paginated portal projects" })
  list(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @Query() query: ListPortalProjectsQueryDto,
  ): Promise<PortalProjectListResponse> {
    return this.projectsService.list(member, query.page, query.pageSize);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a draft project" })
  @ApiCreatedResponse({ description: "Created project" })
  create(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreatePortalProjectDto,
  ): Promise<PortalProjectDetail> {
    return this.projectsService.create(member, user.id, body);
  }

  @Get(":projectId/qr")
  @ApiOperation({ summary: "Get Project QR payload URL for exhibition printouts" })
  @ApiOkResponse({ description: "Public project page URL" })
  getQr(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @Param("projectId") projectId: string,
  ): Promise<ProjectQrResponse> {
    return this.projectQrService.getProjectQr(member, projectId);
  }

  @Get(":projectId")
  @ApiOperation({ summary: "Get project detail with buildings and floors" })
  @ApiOkResponse({ description: "Portal project detail" })
  getById(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @Param("projectId") projectId: string,
  ): Promise<PortalProjectDetail> {
    return this.projectsService.getById(member, projectId);
  }

  @Patch(":projectId")
  @ApiOperation({ summary: "Update project fields and translations" })
  @ApiOkResponse({ description: "Updated project" })
  update(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Body() body: UpdatePortalProjectDto,
  ): Promise<PortalProjectDetail> {
    return this.projectsService.update(member, user.id, projectId, body);
  }

  @Patch(":projectId/publication")
  @ApiOperation({ summary: "Change project publication status (company_admin)" })
  @ApiOkResponse({ description: "Updated publication status" })
  updatePublication(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Body() body: UpdatePortalPublicationDto,
  ): Promise<PortalProjectDetail> {
    return this.projectsService.updatePublication(
      member,
      user.id,
      projectId,
      body,
    );
  }

  @Delete(":projectId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete draft project (company_admin)" })
  @ApiNoContentResponse({ description: "Deleted" })
  async remove(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @Param("projectId") projectId: string,
  ): Promise<void> {
    await this.projectsService.remove(member, projectId);
  }
}
