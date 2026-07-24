import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

import { EMAIL_MAX_LENGTH, PHONE_MAX_LENGTH } from '../../../common/constants/app.constants.js';
import { CRM_CONTACT_NAME_MAX_LENGTH, CRM_NOTE_MAX_LENGTH } from '../../crm.constants.js';
/**
 * Admin creates a manual CRM deal on behalf of a builder company.
 */
export class CreateAdminManualDealDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  companyId!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(CRM_CONTACT_NAME_MAX_LENGTH)
  contactName!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(PHONE_MAX_LENGTH)
  contactPhone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  @MaxLength(EMAIL_MAX_LENGTH)
  contactEmail?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  projectId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(CRM_NOTE_MAX_LENGTH)
  note?: string;
}
