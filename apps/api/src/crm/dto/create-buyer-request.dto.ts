import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

import { CRM_NOTE_MAX_LENGTH } from "../crm.constants.js";

export class CreateBuyerRequestDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  projectId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  apartmentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(CRM_NOTE_MAX_LENGTH)
  note?: string;
}
