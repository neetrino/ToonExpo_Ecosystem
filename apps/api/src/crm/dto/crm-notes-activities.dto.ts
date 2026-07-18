import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";
import { CrmActivityStatus, CrmActivityType } from "@toonexpo/db";

import {
  CRM_ACTIVITY_DESCRIPTION_MAX_LENGTH,
  CRM_ACTIVITY_TITLE_MAX_LENGTH,
  CRM_NOTE_MAX_LENGTH,
} from "../crm.constants.js";

enum CrmActivityTypeDto {
  call = "call",
  email = "email",
  meeting = "meeting",
  send_offer = "send_offer",
  follow_up = "follow_up",
  status_update = "status_update",
  other = "other",
}

enum CrmActivityStatusDto {
  planned = "planned",
  done = "done",
  cancelled = "cancelled",
}

export class CreateCrmNoteDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(CRM_NOTE_MAX_LENGTH)
  body!: string;
}

export class CreateCrmActivityDto {
  @ApiProperty({ enum: CrmActivityTypeDto })
  @IsEnum(CrmActivityTypeDto)
  type!: CrmActivityType;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(CRM_ACTIVITY_TITLE_MAX_LENGTH)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(CRM_ACTIVITY_DESCRIPTION_MAX_LENGTH)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  dueAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  assignedUserId?: string;
}

export class UpdateCrmActivityDto {
  @ApiPropertyOptional({ enum: CrmActivityStatusDto })
  @IsOptional()
  @IsEnum(CrmActivityStatusDto)
  status?: CrmActivityStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(CRM_ACTIVITY_TITLE_MAX_LENGTH)
  title?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(CRM_ACTIVITY_DESCRIPTION_MAX_LENGTH)
  description?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsISO8601()
  dueAt?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MinLength(1)
  assignedUserId?: string | null;
}
