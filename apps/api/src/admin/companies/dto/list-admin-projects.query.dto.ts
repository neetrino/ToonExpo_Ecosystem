import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import {
  ADMIN_COMPANIES_DEFAULT_PAGE_SIZE,
  ADMIN_COMPANIES_MAX_PAGE_SIZE,
  LIST_MIN_PAGE,
} from '../../../common/constants/app.constants.js';

const PROJECT_SEARCH_MAX_LENGTH = 120;

const toStringArray = (value: unknown): string[] | undefined => {
  if (value == null || value === '') {
    return undefined;
  }
  if (Array.isArray(value)) {
    const items = value
      .map(String)
      .map((item) => item.trim())
      .filter(Boolean);
    return items.length > 0 ? items : undefined;
  }
  const items = String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length > 0 ? items : undefined;
};

/**
 * Query for the cross-company admin projects / inventory lists.
 * `companyId` / `buildingId` / `floorId` accept one id, comma-separated, or repeated params.
 */
export class ListAdminProjectsQueryDto {
  @ApiPropertyOptional({ default: LIST_MIN_PAGE, minimum: LIST_MIN_PAGE })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(LIST_MIN_PAGE)
  page: number = LIST_MIN_PAGE;

  @ApiPropertyOptional({
    default: ADMIN_COMPANIES_DEFAULT_PAGE_SIZE,
    minimum: 1,
    maximum: ADMIN_COMPANIES_MAX_PAGE_SIZE,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(ADMIN_COMPANIES_MAX_PAGE_SIZE)
  pageSize: number = ADMIN_COMPANIES_DEFAULT_PAGE_SIZE;

  @ApiPropertyOptional({
    description: 'Filter by one or more builder company ids (comma-separated or repeated)',
    type: [String],
  })
  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  @IsArray()
  @IsString({ each: true })
  @MinLength(1, { each: true })
  companyId?: string[];

  @ApiPropertyOptional({
    description: 'Filter floors/apartments by one or more building ids',
    type: [String],
  })
  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  @IsArray()
  @IsString({ each: true })
  @MinLength(1, { each: true })
  buildingId?: string[];

  @ApiPropertyOptional({
    description: 'Filter apartments by one or more floor ids',
    type: [String],
  })
  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  @IsArray()
  @IsString({ each: true })
  @MinLength(1, { each: true })
  floorId?: string[];

  @ApiPropertyOptional({ description: 'Filter buildings by project id' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  projectId?: string;

  @ApiPropertyOptional({
    description:
      'Case-insensitive search. Projects: name, slug, city, company. Buildings/floors/apartments: names and related project/company (apartment number, floor label). Blank behaves as no search.',
    maxLength: PROJECT_SEARCH_MAX_LENGTH,
  })
  @IsOptional()
  @IsString()
  @MaxLength(PROJECT_SEARCH_MAX_LENGTH)
  search?: string;
}
