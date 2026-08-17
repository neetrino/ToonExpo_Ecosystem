import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

import {
  BANK_PARTNER_OFFER_NAME_MAX_LENGTH,
  BANK_PARTNER_OFFER_SORT_ORDER_MAX,
} from "../../bank-partner-offers.constants.js";

const APPLY_TEMPLATE_IDS_MAX = 200;

export class ApplyProjectBankPartnerOffersDto {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(APPLY_TEMPLATE_IDS_MAX)
  @IsString({ each: true })
  templateIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  addAll?: boolean;
}

export class UpdateProjectBankPartnerOfferDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(BANK_PARTNER_OFFER_NAME_MAX_LENGTH)
  name?: string;

  @ApiPropertyOptional({ type: "object", additionalProperties: true })
  @IsOptional()
  @IsObject()
  fields?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(BANK_PARTNER_OFFER_SORT_ORDER_MAX)
  sortOrder?: number;
}
