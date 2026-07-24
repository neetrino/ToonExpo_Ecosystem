import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { CrmDealStatus, RequestSource } from '@toonexpo/db';

import {
  CRM_DEFAULT_PAGE_SIZE,
  CRM_LOST_REASON_MAX_LENGTH,
  CRM_MAX_PAGE_SIZE,
  CRM_MIN_PAGE,
  CRM_SEARCH_QUERY_MAX_LENGTH,
} from '../crm.constants.js';

enum CrmDealStatusDto {
  new_request = 'new_request',
  assigned = 'assigned',
  contacted = 'contacted',
  follow_up_needed = 'follow_up_needed',
  apartment_selected = 'apartment_selected',
  reserved = 'reserved',
  converted = 'converted',
  closed = 'closed',
  lost = 'lost',
}

enum RequestSourceDto {
  buyer_project_request = 'buyer_project_request',
  builder_buyer_qr_scan = 'builder_buyer_qr_scan',
  manual_builder_entry = 'manual_builder_entry',
  event_interaction = 'event_interaction',
}

const toStringArray = (value: unknown): string[] | undefined => {
  if (value == null || value === '') {
    return undefined;
  }
  if (Array.isArray(value)) {
    return value
      .map(String)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

export class ListCrmDealsQueryDto {
  @ApiPropertyOptional({ default: CRM_MIN_PAGE })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(CRM_MIN_PAGE)
  page: number = CRM_MIN_PAGE;

  @ApiPropertyOptional({ default: CRM_DEFAULT_PAGE_SIZE })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(CRM_MAX_PAGE_SIZE)
  pageSize: number = CRM_DEFAULT_PAGE_SIZE;

  @ApiPropertyOptional({ enum: CrmDealStatusDto })
  @IsOptional()
  @IsEnum(CrmDealStatusDto)
  status?: CrmDealStatus;

  @ApiPropertyOptional({ enum: RequestSourceDto })
  @IsOptional()
  @IsEnum(RequestSourceDto)
  source?: RequestSource;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  projectId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  assignedUserId?: string;

  @ApiPropertyOptional({
    description: 'Search contact name, phone, or email',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(CRM_SEARCH_QUERY_MAX_LENGTH)
  q?: string;
}

export class ListAdminCrmDealsQueryDto extends ListCrmDealsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by builder company id' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  companyId?: string;

  @ApiPropertyOptional({
    description: 'Filter by one or more builder company ids (comma-separated or repeated)',
    type: [String],
  })
  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  @IsArray()
  @IsString({ each: true })
  companyIds?: string[];

  @ApiPropertyOptional({
    description: 'Filter by one or more request sources (comma-separated or repeated)',
    enum: RequestSourceDto,
    isArray: true,
  })
  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  @IsArray()
  @IsEnum(RequestSourceDto, { each: true })
  sources?: RequestSource[];
}

export class UpdateCrmDealDto {
  @ApiPropertyOptional({ enum: CrmDealStatusDto })
  @IsOptional()
  @IsEnum(CrmDealStatusDto)
  status?: CrmDealStatus;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MinLength(1)
  assignedUserId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(CRM_LOST_REASON_MAX_LENGTH)
  lostReason?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MinLength(1)
  projectId?: string | null;
}

export class ListBuyerRequestsQueryDto {
  @ApiPropertyOptional({ default: CRM_MIN_PAGE })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(CRM_MIN_PAGE)
  page: number = CRM_MIN_PAGE;

  @ApiPropertyOptional({ default: CRM_DEFAULT_PAGE_SIZE })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(CRM_MAX_PAGE_SIZE)
  pageSize: number = CRM_DEFAULT_PAGE_SIZE;
}
