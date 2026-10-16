import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

import { MORTGAGE_APPLICATION_NOTE_MAX_LENGTH } from '../../mortgage.constants.js';
import { MortgageCalculatorDto } from './mortgage-calculator.dto.js';

export class CreateMortgageApplicationDto extends MortgageCalculatorDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(MORTGAGE_APPLICATION_NOTE_MAX_LENGTH)
  note?: string;
}
