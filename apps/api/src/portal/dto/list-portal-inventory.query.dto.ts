import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

import {
  PORTAL_DEFAULT_PAGE_SIZE,
  PORTAL_MAX_PAGE_SIZE,
  PORTAL_MIN_PAGE,
} from '../portal.constants.js';

const INVENTORY_SEARCH_MAX_LENGTH = 120;

/**
 * Query for company-scoped portal buildings / floors / apartments hubs.
 */
export class ListPortalInventoryQueryDto {
  @ApiPropertyOptional({ default: PORTAL_MIN_PAGE, minimum: PORTAL_MIN_PAGE })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(PORTAL_MIN_PAGE)
  page: number = PORTAL_MIN_PAGE;

  @ApiPropertyOptional({
    default: PORTAL_DEFAULT_PAGE_SIZE,
    minimum: 1,
    maximum: PORTAL_MAX_PAGE_SIZE,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(PORTAL_MAX_PAGE_SIZE)
  pageSize: number = PORTAL_DEFAULT_PAGE_SIZE;

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
      'Case-insensitive search across names, apartment numbers, floor labels, and project names.',
    maxLength: INVENTORY_SEARCH_MAX_LENGTH,
  })
  @IsOptional()
  @IsString()
  @MaxLength(INVENTORY_SEARCH_MAX_LENGTH)
  search?: string;
}
