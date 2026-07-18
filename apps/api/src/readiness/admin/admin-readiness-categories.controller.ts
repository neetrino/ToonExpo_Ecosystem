import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type {
  ReadinessCategoryItem,
  ReadinessCategoryListResponse,
} from "@toonexpo/contracts";

import { AccountTypes } from "../../auth/decorators/account-types.decorator.js";
import { AdminReadinessCategoriesService } from "./admin-readiness-categories.service.js";
import { CreateReadinessCategoryDto } from "./dto/readiness-category.dto.js";
import { UpdateReadinessCategoryDto } from "./dto/readiness-category.dto.js";

@ApiTags("admin-readiness-categories")
@AccountTypes("platform_admin")
@Controller("admin/readiness/categories")
export class AdminReadinessCategoriesController {
  constructor(private readonly categories: AdminReadinessCategoriesService) {}

  @Get()
  @ApiOperation({ summary: "List readiness categories (including inactive)" })
  @ApiOkResponse({ description: "Category list" })
  list(): Promise<ReadinessCategoryListResponse> {
    return this.categories.list();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a readiness category" })
  @ApiCreatedResponse({ description: "Created category" })
  create(@Body() body: CreateReadinessCategoryDto): Promise<ReadinessCategoryItem> {
    return this.categories.create(body);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a readiness category" })
  @ApiOkResponse({ description: "Updated category" })
  update(
    @Param("id") id: string,
    @Body() body: UpdateReadinessCategoryDto,
  ): Promise<ReadinessCategoryItem> {
    return this.categories.update(id, body);
  }
}
