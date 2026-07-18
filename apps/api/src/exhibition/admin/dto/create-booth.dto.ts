import { IsIn, IsNumber, IsOptional, IsString, MinLength } from "class-validator";

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

export class CreateBoothDto {
  @IsString()
  @MinLength(1)
  code!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsIn(BOOTH_TYPES)
  type!: BoothType;

  @IsNumber()
  xPercent!: number;

  @IsNumber()
  yPercent!: number;

  @IsOptional()
  shapeData?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  locationText?: string;

  @IsOptional()
  @IsIn(PUBLICATION_STATUSES)
  publicationStatus?: (typeof PUBLICATION_STATUSES)[number];
}
