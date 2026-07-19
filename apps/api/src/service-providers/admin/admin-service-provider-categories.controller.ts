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
} from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type {
  ServiceProviderCategoryItem,
  ServiceProviderCategoryListResponse,
} from "@toonexpo/contracts";

import { AccountTypes } from "../../auth/decorators/account-types.decorator.js";
import { AdminServiceProviderCategoriesService } from "./admin-service-provider-categories.service.js";
import {
  CreateServiceProviderCategoryDto,
  UpdateServiceProviderCategoryDto,
} from "./dto/service-provider-category.dto.js";

@ApiTags("admin-service-provider-categories")
@AccountTypes("platform_admin")
@Controller("admin/service-provider-categories")
export class AdminServiceProviderCategoriesController {
  constructor(private readonly categories: AdminServiceProviderCategoriesService) {}

  @Get()
  @ApiOperation({ summary: "List service provider categories" })
  @ApiOkResponse({ description: "Category list" })
  list(): Promise<ServiceProviderCategoryListResponse> {
    return this.categories.list();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create service provider category" })
  @ApiCreatedResponse({ description: "Created category" })
  create(
    @Body() body: CreateServiceProviderCategoryDto,
  ): Promise<ServiceProviderCategoryItem> {
    return this.categories.create(body);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update service provider category" })
  @ApiOkResponse({ description: "Updated category" })
  update(
    @Param("id") id: string,
    @Body() body: UpdateServiceProviderCategoryDto,
  ): Promise<ServiceProviderCategoryItem> {
    return this.categories.update(id, body);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete service provider category" })
  @ApiNoContentResponse({ description: "Deleted" })
  async remove(@Param("id") id: string): Promise<void> {
    await this.categories.remove(id);
  }
}
