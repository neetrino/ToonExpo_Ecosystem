import { IsDateString, IsIn, IsOptional, IsString, MinLength } from "class-validator";

import type { EventStatus } from "@toonexpo/contracts";

const EVENT_STATUSES = [
  "planning",
  "active",
  "completed",
  "archived",
  "cancelled",
] as const satisfies readonly EventStatus[];

const PUBLICATION_STATUSES = ["draft", "published", "archived"] as const;

export class CreateEventDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(1)
  code!: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsIn(EVENT_STATUSES)
  status?: EventStatus;

  @IsOptional()
  @IsIn(PUBLICATION_STATUSES)
  publicationStatus?: (typeof PUBLICATION_STATUSES)[number];
}
