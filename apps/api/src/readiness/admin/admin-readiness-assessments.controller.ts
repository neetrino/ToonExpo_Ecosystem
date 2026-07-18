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
  Put,
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
  ReadinessAssessmentDetail,
  ReadinessAssessmentListResponse,
  ReadinessInternalNoteItem,
  ReadinessRecommendationItem,
  ReadinessRequiredActionItem,
  ReadinessScoreItem,
} from "@toonexpo/contracts";

import { AccountTypes } from "../../auth/decorators/account-types.decorator.js";
import { CurrentUser } from "../../auth/decorators/current-user.decorator.js";
import type { AuthenticatedUser } from "../../auth/types/authenticated-user.js";
import { AdminReadinessAssessmentsService } from "./admin-readiness-assessments.service.js";
import { AdminReadinessNestedService } from "./admin-readiness-nested.service.js";
import {
  CreateReadinessAssessmentDto,
  ListReadinessAssessmentsQueryDto,
  UpdateReadinessAssessmentDto,
  UpsertReadinessScoreDto,
} from "./dto/readiness-assessment.dto.js";
import {
  CreateReadinessInternalNoteDto,
  CreateReadinessRecommendationDto,
  CreateReadinessRequiredActionDto,
  UpdateReadinessRecommendationDto,
  UpdateReadinessRequiredActionDto,
} from "./dto/readiness-nested.dto.js";

@ApiTags("admin-readiness-assessments")
@AccountTypes("platform_admin")
@Controller("admin/readiness/assessments")
export class AdminReadinessAssessmentsController {
  constructor(
    private readonly assessments: AdminReadinessAssessmentsService,
    private readonly nested: AdminReadinessNestedService,
  ) {}

  @Get()
  @ApiOperation({ summary: "List readiness assessments (paginated)" })
  @ApiOkResponse({ description: "Paginated assessments" })
  list(
    @Query() query: ListReadinessAssessmentsQueryDto,
  ): Promise<ReadinessAssessmentListResponse> {
    return this.assessments.list(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create readiness assessment for company or project" })
  @ApiCreatedResponse({ description: "Created assessment with category scores" })
  create(
    @Body() body: CreateReadinessAssessmentDto,
  ): Promise<ReadinessAssessmentDetail> {
    return this.assessments.create(body);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get readiness assessment detail" })
  @ApiOkResponse({ description: "Assessment with scores, actions, notes" })
  getById(@Param("id") id: string): Promise<ReadinessAssessmentDetail> {
    return this.assessments.getById(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update assessment status, overall score, or archive" })
  @ApiOkResponse({ description: "Updated assessment" })
  update(
    @Param("id") id: string,
    @Body() body: UpdateReadinessAssessmentDto,
  ): Promise<ReadinessAssessmentDetail> {
    return this.assessments.update(id, body);
  }

  @Put(":id/scores/:categoryId")
  @ApiOperation({ summary: "Upsert category score for an assessment" })
  @ApiOkResponse({ description: "Updated score" })
  upsertScore(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Param("categoryId") categoryId: string,
    @Body() body: UpsertReadinessScoreDto,
  ): Promise<ReadinessScoreItem> {
    return this.assessments.upsertScore(id, categoryId, user.id, body);
  }

  @Post(":id/recommendations")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Add recommendation to assessment" })
  @ApiCreatedResponse({ description: "Created recommendation" })
  createRecommendation(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() body: CreateReadinessRecommendationDto,
  ): Promise<ReadinessRecommendationItem> {
    return this.nested.createRecommendation(id, user.id, body);
  }

  @Patch(":id/recommendations/:recId")
  @ApiOperation({ summary: "Update recommendation" })
  @ApiOkResponse({ description: "Updated recommendation" })
  updateRecommendation(
    @Param("id") id: string,
    @Param("recId") recId: string,
    @Body() body: UpdateReadinessRecommendationDto,
  ): Promise<ReadinessRecommendationItem> {
    return this.nested.updateRecommendation(id, recId, body);
  }

  @Delete(":id/recommendations/:recId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete recommendation" })
  @ApiNoContentResponse({ description: "Deleted" })
  async deleteRecommendation(
    @Param("id") id: string,
    @Param("recId") recId: string,
  ): Promise<void> {
    await this.nested.deleteRecommendation(id, recId);
  }

  @Post(":id/required-actions")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Add required action to assessment" })
  @ApiCreatedResponse({ description: "Created required action" })
  createRequiredAction(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() body: CreateReadinessRequiredActionDto,
  ): Promise<ReadinessRequiredActionItem> {
    return this.nested.createRequiredAction(id, user.id, body);
  }

  @Patch(":id/required-actions/:actionId")
  @ApiOperation({ summary: "Update required action (including status)" })
  @ApiOkResponse({ description: "Updated required action" })
  updateRequiredAction(
    @Param("id") id: string,
    @Param("actionId") actionId: string,
    @Body() body: UpdateReadinessRequiredActionDto,
  ): Promise<ReadinessRequiredActionItem> {
    return this.nested.updateRequiredAction(id, actionId, body);
  }

  @Delete(":id/required-actions/:actionId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete required action" })
  @ApiNoContentResponse({ description: "Deleted" })
  async deleteRequiredAction(
    @Param("id") id: string,
    @Param("actionId") actionId: string,
  ): Promise<void> {
    await this.nested.deleteRequiredAction(id, actionId);
  }

  @Post(":id/internal-notes")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Add internal note (admin-only)" })
  @ApiCreatedResponse({ description: "Created internal note" })
  createInternalNote(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() body: CreateReadinessInternalNoteDto,
  ): Promise<ReadinessInternalNoteItem> {
    return this.nested.createInternalNote(id, user.id, body);
  }

  @Delete(":id/internal-notes/:noteId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete internal note" })
  @ApiNoContentResponse({ description: "Deleted" })
  async deleteInternalNote(
    @Param("id") id: string,
    @Param("noteId") noteId: string,
  ): Promise<void> {
    await this.nested.deleteInternalNote(id, noteId);
  }
}
