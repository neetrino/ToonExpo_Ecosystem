import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

import {
  CATALOG_DEFAULT_PAGE_SIZE,
  CATALOG_MAX_PAGE_SIZE,
  CATALOG_MIN_PAGE,
} from "../catalog.constants.js";

enum ApartmentSalesStatusQuery {
  available = "available",
  reserved = "reserved",
  sold = "sold",
}

export class ListProjectsQueryDto {
  @ApiPropertyOptional({ default: CATALOG_MIN_PAGE, minimum: CATALOG_MIN_PAGE })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(CATALOG_MIN_PAGE)
  page: number = CATALOG_MIN_PAGE;

  @ApiPropertyOptional({
    default: CATALOG_DEFAULT_PAGE_SIZE,
    minimum: 1,
    maximum: CATALOG_MAX_PAGE_SIZE,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(CATALOG_MAX_PAGE_SIZE)
  pageSize: number = CATALOG_DEFAULT_PAGE_SIZE;

  @ApiPropertyOptional({ enum: ApartmentSalesStatusQuery })
  @IsOptional()
  @IsEnum(ApartmentSalesStatusQuery)
  salesStatus?: ApartmentSalesStatusQuery;

  @ApiPropertyOptional({ description: "Minimum apartment price (major units)" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: "Maximum apartment price (major units)" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: "Exact rooms count filter" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  rooms?: number;

  @ApiPropertyOptional({ example: "Yerevan" })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  city?: string;

  @ApiPropertyOptional({ description: "Builder company id" })
  @IsOptional()
  @IsString()
  builderId?: string;
}
