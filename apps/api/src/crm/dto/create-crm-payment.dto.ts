import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

import {
  CRM_PAYMENT_AMOUNT_MAX,
  CRM_PAYMENT_AMOUNT_MIN,
  CRM_PAYMENT_NOTE_MAX_LENGTH,
} from '../crm.constants.js';

export class CreateCrmPaymentDto {
  @ApiProperty({ example: 1_500_000, minimum: CRM_PAYMENT_AMOUNT_MIN })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(CRM_PAYMENT_AMOUNT_MIN)
  @Max(CRM_PAYMENT_AMOUNT_MAX)
  amount!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(CRM_PAYMENT_NOTE_MAX_LENGTH)
  note?: string;
}
