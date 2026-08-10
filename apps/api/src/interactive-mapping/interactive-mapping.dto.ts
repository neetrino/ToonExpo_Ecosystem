import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
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
} from '../common/constants/app.constants.js';

const DISTRICT_NAME_MAX_LENGTH = 200;
const DISTRICT_SLUG_MAX_LENGTH = 120;
const SETUP_FLOORS_MIN = 1;
const SETUP_FLOORS_MAX = 200;

enum PublicationStatusDto {
  draft = 'draft',
  published = 'published',
  archived = 'archived',
}

export class CreateDistrictDto {
  @ApiProperty({ example: 'North Quarter' })
  @IsString()
  @MinLength(1)
  @MaxLength(DISTRICT_NAME_MAX_LENGTH)
  name!: string;

  @ApiPropertyOptional({ example: 'north-quarter' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(DISTRICT_SLUG_MAX_LENGTH)
  slug?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({ enum: PublicationStatusDto })
  @IsOptional()
  @IsEnum(PublicationStatusDto)
  publicationStatus?: PublicationStatusDto;
}

export class UpdateDistrictDto {
  @ApiPropertyOptional({ example: 'North Quarter' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(DISTRICT_NAME_MAX_LENGTH)
  name?: string;

  @ApiPropertyOptional({ example: 'north-quarter' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(DISTRICT_SLUG_MAX_LENGTH)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({ enum: PublicationStatusDto })
  @IsOptional()
  @IsEnum(PublicationStatusDto)
  publicationStatus?: PublicationStatusDto;
}

export class SetupBuildingFloorsDto {
  @ApiProperty({ minimum: SETUP_FLOORS_MIN, maximum: SETUP_FLOORS_MAX, example: 12 })
  @IsInt()
  @Min(SETUP_FLOORS_MIN)
  @Max(SETUP_FLOORS_MAX)
  floorCount!: number;

  @ApiPropertyOptional({ description: 'Media asset for primary building render canvas' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  renderMediaAssetId?: string;
}

export class InteractiveMappingProjectParamDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  projectId!: string;
}

export class InteractiveMappingDistrictParamDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  districtId!: string;
}

export class InteractiveMappingBuildingParamDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  buildingId!: string;
}

const PROJECT_SEARCH_MAX_LENGTH = 120;

/**
 * Query for interactive-mapping project lists (admin + portal).
 */
export class ListInteractiveMappingProjectsQueryDto {
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
    description:
      'Case-insensitive search over project name, slug, city and builder company name. Blank behaves as no search.',
    maxLength: PROJECT_SEARCH_MAX_LENGTH,
  })
  @IsOptional()
  @IsString()
  @MaxLength(PROJECT_SEARCH_MAX_LENGTH)
  search?: string;
}
