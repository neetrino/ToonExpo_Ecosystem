import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from "class-validator";

import type { BoothType } from "@toonexpo/contracts";

const BOOTH_TYPES = [
  "builder",
  "bank",
  "partner",
  "sponsor",
  "service",
  "info",
  "entrance",
  "other",
] as const satisfies readonly BoothType[];

const PUBLICATION_STATUSES = ["draft", "published", "archived"] as const;

export class UpdateBoothDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  code?: string;

  @IsOptional()
  @ValidateIf((_obj, value) => value != null)
  @IsString()
  name?: string | null;

  @IsOptional()
  @IsIn(BOOTH_TYPES)
  type?: BoothType;

  @IsOptional()
  @IsNumber()
  xPercent?: number;

  @IsOptional()
  @IsNumber()
  yPercent?: number;

  @IsOptional()
  shapeData?: Record<string, unknown> | null;

  @IsOptional()
  @ValidateIf((_obj, value) => value != null)
  @IsString()
  locationText?: string | null;

  @IsOptional()
  @IsIn(PUBLICATION_STATUSES)
  publicationStatus?: (typeof PUBLICATION_STATUSES)[number];
}
