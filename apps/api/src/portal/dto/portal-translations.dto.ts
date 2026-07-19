import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from "class-validator";

import { PORTAL_DESCRIPTION_MAX_LENGTH } from "../portal.constants.js";

export class LocaleTextMapDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(PORTAL_DESCRIPTION_MAX_LENGTH)
  hy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(PORTAL_DESCRIPTION_MAX_LENGTH)
  ru?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(PORTAL_DESCRIPTION_MAX_LENGTH)
  en?: string;
}

export class PortalTranslationsDto {
  @ApiPropertyOptional({ type: LocaleTextMapDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => LocaleTextMapDto)
  name?: LocaleTextMapDto;

  @ApiPropertyOptional({ type: LocaleTextMapDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => LocaleTextMapDto)
  shortDescription?: LocaleTextMapDto;

  @ApiPropertyOptional({ type: LocaleTextMapDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => LocaleTextMapDto)
  fullDescription?: LocaleTextMapDto;

  @ApiPropertyOptional({ type: LocaleTextMapDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => LocaleTextMapDto)
  locationText?: LocaleTextMapDto;

  @ApiPropertyOptional({ type: LocaleTextMapDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => LocaleTextMapDto)
  description?: LocaleTextMapDto;
}
