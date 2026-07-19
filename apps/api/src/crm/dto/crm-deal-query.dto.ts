import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from "class-validator";
import { CrmDealStatus, RequestSource } from "@toonexpo/db";

import {
  CRM_DEFAULT_PAGE_SIZE,
  CRM_LOST_REASON_MAX_LENGTH,
  CRM_MAX_PAGE_SIZE,
  CRM_MIN_PAGE,
} from "../crm.constants.js";

enum CrmDealStatusDto {
  new_request = "new_request",
  assigned = "assigned",
  contacted = "contacted",
  follow_up_needed = "follow_up_needed",
  apartment_selected = "apartment_selected",
  reserved = "reserved",
  converted = "converted",
  closed = "closed",
  lost = "lost",
}

enum RequestSourceDto {
  buyer_project_request = "buyer_project_request",
  builder_buyer_qr_scan = "builder_buyer_qr_scan",
  manual_builder_entry = "manual_builder_entry",
  event_interaction = "event_interaction",
}

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
