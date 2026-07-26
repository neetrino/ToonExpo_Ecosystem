import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

import {
  CATALOG_DEFAULT_PAGE_SIZE,
  CATALOG_MAX_PAGE_SIZE,
  CATALOG_MIN_PAGE,
} from '../catalog.constants.js';

enum ApartmentSalesStatusQuery {
  available = 'available',
  reserved = 'reserved',
  sold = 'sold',
}

const MAX_ROOMS_FILTER_VALUES = 8;

const toPositiveIntArray = (value: unknown): number[] | undefined => {
  if (value == null || value === '') {
    return undefined;
  }

  const rawItems = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : [value];

  const parsed = rawItems
    .map((item) => Number.parseInt(String(item).trim(), 10))
    .filter((item) => Number.isFinite(item) && item >= 1);

  return parsed.length > 0 ? [...new Set(parsed)] : undefined;
};

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

  @ApiPropertyOptional({ description: 'Minimum apartment price (major units)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum apartment price (major units)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Rooms filter — one or more counts (comma-separated or repeated). `4` means 4+.',
    type: [Number],
    example: [1, 2, 4],
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => toPositiveIntArray(value))
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(MAX_ROOMS_FILTER_VALUES)
  @IsInt({ each: true })
  @Min(1, { each: true })
  rooms?: number[];

  @ApiPropertyOptional({ example: 'Yerevan' })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  city?: string;

  @ApiPropertyOptional({ description: 'Builder company id' })
  @IsOptional()
  @IsString()
  builderId?: string;

  @ApiPropertyOptional({
    enum: ['hy', 'ru', 'en'],
    description: 'Catalog content locale; falls back to hy',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  locale?: string;
}
