import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

import {
  CATALOG_DEFAULT_PAGE_SIZE,
  CATALOG_MAX_PAGE_SIZE,
  CATALOG_MIN_PAGE,
} from '../catalog.constants.js';

const toOptionalBoolean = (value: unknown): boolean | undefined => {
  if (value == null || value === '') {
    return undefined;
  }
  if (value === true || value === 'true' || value === '1') {
    return true;
  }
  if (value === false || value === 'false' || value === '0') {
    return false;
  }
  return undefined;
};

/**
 * Query for public apartment list (homepage featured band).
 */
export class ListApartmentsQueryDto {
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

  @ApiPropertyOptional({ description: 'When true, only admin-curated homepage apartments' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => toOptionalBoolean(value))
  @IsBoolean()
  featuredOnHome?: boolean;

  @ApiPropertyOptional({
    enum: ['hy', 'ru', 'en'],
    description: 'Catalog content locale; unknown values resolve to hy',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  locale?: string;
}
