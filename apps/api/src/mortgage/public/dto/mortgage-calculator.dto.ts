import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  ValidateIf,
} from "class-validator";

import {
  MORTGAGE_PROPERTY_PRICE_MAX,
  MORTGAGE_PROPERTY_PRICE_MIN,
  BANK_OFFER_DOWN_PAYMENT_MAX,
  BANK_OFFER_DOWN_PAYMENT_MIN,
  BANK_OFFER_TERM_MAX_YEARS,
  BANK_OFFER_TERM_MIN_YEARS,
} from "../../mortgage.constants.js";

export class MortgageCalculatorDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(MORTGAGE_PROPERTY_PRICE_MIN)
  @Max(MORTGAGE_PROPERTY_PRICE_MAX)
  propertyPrice!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((dto: MortgageCalculatorDto) => dto.downPaymentAmount == null)
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(BANK_OFFER_DOWN_PAYMENT_MIN)
  @Max(BANK_OFFER_DOWN_PAYMENT_MAX)
  downPaymentPercent?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((dto: MortgageCalculatorDto) => dto.downPaymentPercent == null)
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(0)
  downPaymentAmount?: number;

  @Type(() => Number)
  @IsInt()
  @Min(BANK_OFFER_TERM_MIN_YEARS)
  @Max(BANK_OFFER_TERM_MAX_YEARS)
  loanTermYears!: number;

  @IsString()
  @MinLength(1)
  bankOfferId!: string;
}
