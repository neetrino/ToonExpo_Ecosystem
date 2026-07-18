import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

import {
  CRM_CONTACT_NAME_MAX_LENGTH,
  CRM_NOTE_MAX_LENGTH,
} from "../crm.constants.js";
import { EMAIL_MAX_LENGTH, PHONE_MAX_LENGTH } from "../../common/constants/app.constants.js";

export class CreateDealFromScanDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  scanEventId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  projectId?: string;

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

export class CreateManualDealDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(CRM_CONTACT_NAME_MAX_LENGTH)
  contactName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(PHONE_MAX_LENGTH)
  contactPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  @MaxLength(EMAIL_MAX_LENGTH)
  contactEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  projectId?: string;

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
