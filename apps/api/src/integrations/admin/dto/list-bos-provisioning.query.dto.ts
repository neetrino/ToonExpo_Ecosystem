import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

import {
  ADMIN_BOS_PROVISIONING_DEFAULT_PAGE_SIZE,
  ADMIN_BOS_PROVISIONING_MAX_PAGE_SIZE,
  LIST_MIN_PAGE,
} from "../../../common/constants/app.constants.js";

const BOS_PROVISIONING_SEARCH_MAX_LENGTH = 120;

enum BosProvisioningStatusFilterDto {
  success = "success",
  linked_existing = "linked_existing",
  failed = "failed",
  partial = "partial",
}

export class ListBosProvisioningQueryDto {
  @ApiPropertyOptional({ default: LIST_MIN_PAGE, minimum: LIST_MIN_PAGE })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(LIST_MIN_PAGE)
  page: number = LIST_MIN_PAGE;

  @ApiPropertyOptional({
    default: ADMIN_BOS_PROVISIONING_DEFAULT_PAGE_SIZE,
    minimum: 1,
    maximum: ADMIN_BOS_PROVISIONING_MAX_PAGE_SIZE,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(ADMIN_BOS_PROVISIONING_MAX_PAGE_SIZE)
  pageSize: number = ADMIN_BOS_PROVISIONING_DEFAULT_PAGE_SIZE;

  @ApiPropertyOptional({ enum: BosProvisioningStatusFilterDto })
  @IsOptional()
  @IsEnum(BosProvisioningStatusFilterDto)
  status?: BosProvisioningStatusFilterDto;

  @ApiPropertyOptional({
    description:
      "Case-insensitive search over company name, contact, email, BOS company id, request id, and event cycle. Blank behaves as no search.",
    maxLength: BOS_PROVISIONING_SEARCH_MAX_LENGTH,
  })
  @IsOptional()
  @IsString()
  @MaxLength(BOS_PROVISIONING_SEARCH_MAX_LENGTH)
  search?: string;
}
