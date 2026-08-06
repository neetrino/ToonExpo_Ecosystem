import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

import {
  ADMIN_COMPANIES_DEFAULT_PAGE_SIZE,
  ADMIN_COMPANIES_MAX_PAGE_SIZE,
  LIST_MIN_PAGE,
} from '../../../common/constants/app.constants.js';

const PROJECT_SEARCH_MAX_LENGTH = 120;

/**
 * Query for the cross-company admin projects list.
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

  @ApiPropertyOptional({ description: 'Filter projects by builder company id' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  companyId?: string;

  @ApiPropertyOptional({ description: 'Filter floors/apartments by building id' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  buildingId?: string;

  @ApiPropertyOptional({ description: 'Filter buildings by project id' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  projectId?: string;

  @ApiPropertyOptional({
    description:
      'Case-insensitive search over project name, slug, city and builder company name. Blank behaves as no search.',
    maxLength: PROJECT_SEARCH_MAX_LENGTH,
  })
  @IsOptional()
  @IsString()
  @MaxLength(PROJECT_SEARCH_MAX_LENGTH)
  search?: string;
}
