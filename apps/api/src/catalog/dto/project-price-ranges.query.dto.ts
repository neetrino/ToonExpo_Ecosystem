import { BadRequestException } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";

import { CATALOG_PRICES_MAX_PROJECT_IDS } from "../catalog.constants.js";

export class ProjectPriceRangesQueryDto {
  @ApiProperty({
    description: `Comma-separated project ids (max ${CATALOG_PRICES_MAX_PROJECT_IDS})`,
    example: "proj_1,proj_2",
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  ids!: string;
}

/**
 * Parses and caps the comma-separated project id list for the bulk overlay.
 */
export const parseProjectPriceRangeIds = (raw: string): string[] => {
  const ids = [
    ...new Set(
      raw
        .split(",")
        .map((part) => part.trim())
        .filter((part) => part.length > 0),
    ),
  ];

  if (ids.length === 0) {
    throw new BadRequestException("ids query is required");
  }

  if (ids.length > CATALOG_PRICES_MAX_PROJECT_IDS) {
    throw new BadRequestException(
      `Too many project ids (max ${CATALOG_PRICES_MAX_PROJECT_IDS})`,
    );
  }

  return ids;
};
