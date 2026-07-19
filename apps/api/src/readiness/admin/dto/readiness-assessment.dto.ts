import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from "class-validator";
import {
  ReadinessAssessmentTargetType,
  ReadinessScoreStatus,
} from "@toonexpo/db";

import {
  READINESS_DEFAULT_PAGE_SIZE,
  READINESS_MAX_PAGE_SIZE,
  READINESS_MIN_PAGE,
  READINESS_SCORE_MAX,
  READINESS_SCORE_MIN,
} from "../../readiness.constants.js";

enum ReadinessAssessmentTargetTypeDto {
  builder_company = "builder_company",
  project = "project",
}

enum ReadinessScoreStatusDto {
  not_started = "not_started",
  needs_improvement = "needs_improvement",
  in_progress = "in_progress",
  ready = "ready",
  blocked = "blocked",
}

export class ListReadinessAssessmentsQueryDto {
  @ApiPropertyOptional({ default: READINESS_MIN_PAGE })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(READINESS_MIN_PAGE)
  page: number = READINESS_MIN_PAGE;

  @ApiPropertyOptional({ default: READINESS_DEFAULT_PAGE_SIZE })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(READINESS_MAX_PAGE_SIZE)
  pageSize: number = READINESS_DEFAULT_PAGE_SIZE;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  builderCompanyId?: string;

  @ApiPropertyOptional({ enum: ReadinessAssessmentTargetTypeDto })
  @IsOptional()
  @IsEnum(ReadinessAssessmentTargetTypeDto)
  targetType?: ReadinessAssessmentTargetType;

  @ApiPropertyOptional({ enum: ReadinessScoreStatusDto })
  @IsOptional()
  @IsEnum(ReadinessScoreStatusDto)
  status?: ReadinessScoreStatus;
}

export class CreateReadinessAssessmentDto {
  @ApiPropertyOptional({ enum: ReadinessAssessmentTargetTypeDto })
  @IsEnum(ReadinessAssessmentTargetTypeDto)
  targetType!: ReadinessAssessmentTargetType;

  @IsString()
  @MinLength(1)
  builderCompanyId!: string;

  @ValidateIf((dto: CreateReadinessAssessmentDto) => dto.targetType === "project")
  @IsString()
  @MinLength(1)
  projectId?: string;
}

export class UpdateReadinessAssessmentDto {
  @ApiPropertyOptional({ enum: ReadinessScoreStatusDto })
  @IsOptional()
  @IsEnum(ReadinessScoreStatusDto)
  status?: ReadinessScoreStatus;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsInt()
  @Min(READINESS_SCORE_MIN)
  @Max(READINESS_SCORE_MAX)
  overallScore?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  archive?: boolean;
}

export class UpsertReadinessScoreDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(READINESS_SCORE_MIN)
  @Max(READINESS_SCORE_MAX)
  score?: number;

  @ApiPropertyOptional({ enum: ReadinessScoreStatusDto })
  @IsOptional()
  @IsEnum(ReadinessScoreStatusDto)
  status?: ReadinessScoreStatus;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(2000)
  recommendationSummary?: string | null;
}
