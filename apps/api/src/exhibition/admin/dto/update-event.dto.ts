import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from "class-validator";

import type { EventStatus } from "@toonexpo/contracts";

const EVENT_STATUSES = [
  "planning",
  "active",
  "completed",
  "archived",
  "cancelled",
] as const satisfies readonly EventStatus[];

const PUBLICATION_STATUSES = ["draft", "published", "archived"] as const;

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  code?: string;

  @IsOptional()
  @ValidateIf((_obj, value) => value != null)
  @IsDateString()
  startDate?: string | null;

  @IsOptional()
  @ValidateIf((_obj, value) => value != null)
  @IsDateString()
  endDate?: string | null;

  @IsOptional()
  @IsIn(EVENT_STATUSES)
  status?: EventStatus;

  @IsOptional()
  @IsIn(PUBLICATION_STATUSES)
  publicationStatus?: (typeof PUBLICATION_STATUSES)[number];
}
