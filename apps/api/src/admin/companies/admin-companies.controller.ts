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
} from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type {
  CompanyListResponse,
  CompanyResponse,
  ProvisionCompanyResponse,
} from "@toonexpo/contracts";
import { CompanyStatus, CompanyType } from "@toonexpo/db";

import { AccountTypes } from "../../auth/decorators/account-types.decorator.js";
import { AdminCompaniesService } from "./admin-companies.service.js";
import { CreateCompanyDto } from "./dto/create-company.dto.js";
import { ListCompaniesQueryDto } from "./dto/list-companies.query.dto.js";
import { UpdateCompanyDto } from "./dto/update-company.dto.js";

@ApiTags("admin-companies")
@AccountTypes("platform_admin")
@Controller("admin/companies")
export class AdminCompaniesController {
  constructor(private readonly companiesService: AdminCompaniesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Provision a company with first company_admin" })
  @ApiCreatedResponse({ description: "Company and invited admin created" })
  create(@Body() body: CreateCompanyDto): Promise<ProvisionCompanyResponse> {
    return this.companiesService.create({
      name: body.name,
      type: body.type as CompanyType,
      adminName: body.adminName,
      adminEmail: body.adminEmail,
      ...(body.description !== undefined
        ? { description: body.description }
        : {}),
      ...(body.adminPhone !== undefined ? { adminPhone: body.adminPhone } : {}),
      ...(body.locale !== undefined ? { locale: body.locale } : {}),
    });
  }

  @Get()
  @ApiOperation({ summary: "List companies (paginated)" })
  @ApiOkResponse({ description: "Paginated company list" })
  list(@Query() query: ListCompaniesQueryDto): Promise<CompanyListResponse> {
    return this.companiesService.list(query.page, query.pageSize);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a company by id" })
  @ApiOkResponse({ description: "Company detail" })
  getById(@Param("id") id: string): Promise<CompanyResponse> {
    return this.companiesService.getById(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update company basic fields or status" })
  @ApiOkResponse({ description: "Updated company" })
  update(
    @Param("id") id: string,
    @Body() body: UpdateCompanyDto,
  ): Promise<CompanyResponse> {
    return this.companiesService.update(id, {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.description !== undefined
        ? { description: body.description }
        : {}),
      ...(body.status !== undefined
        ? { status: body.status as CompanyStatus }
        : {}),
    });
  }

  @Post(":id/resend-invite")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Resend set-password invite to company admin" })
  @ApiNoContentResponse({ description: "Invite resent" })
  async resendInvite(@Param("id") id: string): Promise<void> {
    await this.companiesService.resendInvite(id);
  }
}
