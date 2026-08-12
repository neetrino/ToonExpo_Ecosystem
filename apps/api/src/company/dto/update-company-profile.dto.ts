import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsUrl, MaxLength, ValidateIf } from 'class-validator';

import { COMPANY_DESCRIPTION_MAX_LENGTH } from '../../common/constants/app.constants.js';

const optionalNullableString = () =>
  ValidateIf((_: unknown, value: unknown) => value !== null && value !== undefined);

export class UpdateCompanyProfileDto {
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @optionalNullableString()
  @IsString()
  @MaxLength(COMPANY_DESCRIPTION_MAX_LENGTH)
  description?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @optionalNullableString()
  @IsString()
  logoMediaId?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @optionalNullableString()
  @IsString()
  @MaxLength(64)
  phone?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @optionalNullableString()
  @IsString()
  @MaxLength(200)
  contactPerson?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @optionalNullableString()
  @IsEmail()
  @MaxLength(320)
  email?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @optionalNullableString()
  @IsUrl({ require_protocol: true })
  @MaxLength(2000)
  websiteUrl?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @optionalNullableString()
  @IsUrl({ require_protocol: true })
  @MaxLength(2000)
  instagramUrl?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @optionalNullableString()
  @IsUrl({ require_protocol: true })
  @MaxLength(2000)
  facebookUrl?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @optionalNullableString()
  @IsString()
  @MaxLength(200)
  region?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @optionalNullableString()
  @IsString()
  @MaxLength(500)
  address?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @optionalNullableString()
  @IsUrl({ require_protocol: true })
  @MaxLength(2000)
  mediaMaterialsUrl?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @optionalNullableString()
  @IsUrl({ require_protocol: true })
  @MaxLength(2000)
  advertisingMaterialsUrl?: string | null;
}
