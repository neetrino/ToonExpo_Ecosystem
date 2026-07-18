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
} from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type {
  AdminServiceProviderItem,
  AdminServiceProviderListResponse,
} from "@toonexpo/contracts";

import { AccountTypes } from "../../auth/decorators/account-types.decorator.js";
import { CurrentUser } from "../../auth/decorators/current-user.decorator.js";
import type { AuthenticatedUser } from "../../auth/types/authenticated-user.js";
import { AdminServiceProvidersService } from "./admin-service-providers.service.js";
import {
  CreateServiceProviderDto,
  ListAdminServiceProvidersQueryDto,
  UpdateServiceProviderDto,
} from "./dto/service-provider.dto.js";

@ApiTags("admin-service-providers")
@AccountTypes("platform_admin")
@Controller("admin/service-providers")
export class AdminServiceProvidersController {
  constructor(private readonly providers: AdminServiceProvidersService) {}

  @Get()
  @ApiOperation({ summary: "List service providers" })
  @ApiOkResponse({ description: "Provider list" })
  list(
    @Query() query: ListAdminServiceProvidersQueryDto,
  ): Promise<AdminServiceProviderListResponse> {
    return this.providers.list(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create service provider" })
  @ApiCreatedResponse({ description: "Created provider" })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateServiceProviderDto,
  ): Promise<AdminServiceProviderItem> {
    return this.providers.create(user.id, body);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get service provider by id" })
  @ApiOkResponse({ description: "Provider detail" })
  getById(@Param("id") id: string): Promise<AdminServiceProviderItem> {
    return this.providers.getById(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update service provider" })
  @ApiOkResponse({ description: "Updated provider" })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() body: UpdateServiceProviderDto,
  ): Promise<AdminServiceProviderItem> {
    return this.providers.update(id, user.id, body);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete service provider" })
  @ApiNoContentResponse({ description: "Deleted" })
  async remove(@Param("id") id: string): Promise<void> {
    await this.providers.remove(id);
  }
}
