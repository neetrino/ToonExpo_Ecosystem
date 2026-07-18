import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from "class-validator";
import {
  ReadinessRequiredActionStatus,
  ReadinessVisibility,
} from "@toonexpo/db";

import {
  READINESS_DESCRIPTION_MAX_LENGTH,
  READINESS_ENTITY_ID_MAX_LENGTH,
  READINESS_ENTITY_TYPE_MAX_LENGTH,
  READINESS_NOTE_BODY_MAX_LENGTH,
  READINESS_TITLE_MAX_LENGTH,
} from "../../readiness.constants.js";

enum ReadinessVisibilityDto {
  builder_visible = "builder_visible",
  internal_only = "internal_only",
}

enum ReadinessRequiredActionStatusDto {
  open = "open",
  in_progress = "in_progress",
  done = "done",
  blocked = "blocked",
  cancelled = "cancelled",
}

export class CreateReadinessRecommendationDto {
  @IsString()
  @MinLength(1)
  @MaxLength(READINESS_TITLE_MAX_LENGTH)
  title!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(READINESS_DESCRIPTION_MAX_LENGTH)
  description!: string;

  @IsEnum(ReadinessVisibilityDto)
  visibility!: ReadinessVisibility;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  scoreId?: string;
}

export class UpdateReadinessRecommendationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(READINESS_TITLE_MAX_LENGTH)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(READINESS_DESCRIPTION_MAX_LENGTH)
  description?: string;

  @ApiPropertyOptional({ enum: ReadinessVisibilityDto })
  @IsOptional()
  @IsEnum(ReadinessVisibilityDto)
  visibility?: ReadinessVisibility;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MinLength(1)
  scoreId?: string | null;
}

export class CreateReadinessRequiredActionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(READINESS_TITLE_MAX_LENGTH)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(READINESS_DESCRIPTION_MAX_LENGTH)
  description?: string;

  @ApiPropertyOptional({ enum: ReadinessRequiredActionStatusDto })
  @IsOptional()
  @IsEnum(ReadinessRequiredActionStatusDto)
  status?: ReadinessRequiredActionStatus;

  @IsEnum(ReadinessVisibilityDto)
  visibility!: ReadinessVisibility;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  scoreId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(READINESS_ENTITY_TYPE_MAX_LENGTH)
  relatedEntityType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(READINESS_ENTITY_ID_MAX_LENGTH)
  relatedEntityId?: string;
}

export class UpdateReadinessRequiredActionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(READINESS_TITLE_MAX_LENGTH)
  title?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(READINESS_DESCRIPTION_MAX_LENGTH)
  description?: string | null;

  @ApiPropertyOptional({ enum: ReadinessRequiredActionStatusDto })
  @IsOptional()
  @IsEnum(ReadinessRequiredActionStatusDto)
  status?: ReadinessRequiredActionStatus;

  @ApiPropertyOptional({ enum: ReadinessVisibilityDto })
  @IsOptional()
  @IsEnum(ReadinessVisibilityDto)
  visibility?: ReadinessVisibility;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MinLength(1)
  scoreId?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(READINESS_ENTITY_TYPE_MAX_LENGTH)
  relatedEntityType?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(READINESS_ENTITY_ID_MAX_LENGTH)
  relatedEntityId?: string | null;
}

export class CreateReadinessInternalNoteDto {
  @IsString()
  @MinLength(1)
  @MaxLength(READINESS_NOTE_BODY_MAX_LENGTH)
  body!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  scoreId?: string;
}
