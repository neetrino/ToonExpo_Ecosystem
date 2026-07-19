import { ApiPropertyOptional } from "@nestjs/swagger";
import { PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

import {
  BANK_OFFER_CALCULATION_NOTES_MAX_LENGTH,
  BANK_OFFER_DOWN_PAYMENT_MAX,
  BANK_OFFER_DOWN_PAYMENT_MIN,
  BANK_OFFER_FEES_MAX_LENGTH,
  BANK_OFFER_MAX_TERM_OPTIONS,
  BANK_OFFER_RATE_MAX,
  BANK_OFFER_RATE_MIN,
  BANK_OFFER_SHORT_DESCRIPTION_MAX_LENGTH,
  BANK_OFFER_SORT_ORDER_MAX,
  BANK_OFFER_TERM_MAX_YEARS,
  BANK_OFFER_TERM_MIN_YEARS,
  BANK_OFFER_TITLE_MAX_LENGTH,
} from "../../mortgage.constants.js";

export class PortalCreateBankOfferDto {
  @IsString()
  @MinLength(1)
  @MaxLength(BANK_OFFER_TITLE_MAX_LENGTH)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(BANK_OFFER_SHORT_DESCRIPTION_MAX_LENGTH)
  shortDescription?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(BANK_OFFER_RATE_MIN)
  @Max(BANK_OFFER_RATE_MAX)
  rate!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(BANK_OFFER_RATE_MIN)
  @Max(BANK_OFFER_RATE_MAX)
  apr?: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(BANK_OFFER_DOWN_PAYMENT_MIN)
  @Max(BANK_OFFER_DOWN_PAYMENT_MAX)
  minDownPaymentPercent!: number;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(BANK_OFFER_MAX_TERM_OPTIONS)
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(BANK_OFFER_TERM_MIN_YEARS, { each: true })
  @Max(BANK_OFFER_TERM_MAX_YEARS, { each: true })
  termOptionsYears!: number[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(BANK_OFFER_FEES_MAX_LENGTH)
  fees?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(BANK_OFFER_CALCULATION_NOTES_MAX_LENGTH)
  calculationNotes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(BANK_OFFER_SORT_ORDER_MAX)
  sortOrder?: number;
}

export class PortalUpdateBankOfferDto extends PartialType(PortalCreateBankOfferDto) {}
