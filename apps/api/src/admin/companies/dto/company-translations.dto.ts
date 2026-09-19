import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsObject, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';

import { COMPANY_DESCRIPTION_MAX_LENGTH } from '../../../common/constants/app.constants.js';

export class CompanyLocaleTextDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(COMPANY_DESCRIPTION_MAX_LENGTH)
  hy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(COMPANY_DESCRIPTION_MAX_LENGTH)
  ru?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(COMPANY_DESCRIPTION_MAX_LENGTH)
  en?: string;
}

export class CompanyTranslationsDto {
  @ApiPropertyOptional({ type: CompanyLocaleTextDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CompanyLocaleTextDto)
  name?: CompanyLocaleTextDto;

  @ApiPropertyOptional({ type: CompanyLocaleTextDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CompanyLocaleTextDto)
  shortDescription?: CompanyLocaleTextDto;

  @ApiPropertyOptional({ type: CompanyLocaleTextDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CompanyLocaleTextDto)
  description?: CompanyLocaleTextDto;
}
