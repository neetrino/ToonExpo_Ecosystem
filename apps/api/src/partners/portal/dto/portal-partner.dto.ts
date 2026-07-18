import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsString, MaxLength } from "class-validator";

import { PartnerProfileTranslationsDto, PartnerContactsDto } from "../../admin/dto/admin-partner.dto.js";

export class UpdatePortalPartnerDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(8000)
  shortDescription?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(8000)
  fullDescription?: string | null;

  @ApiPropertyOptional({ type: PartnerContactsDto })
  @IsOptional()
  @Type(() => PartnerContactsDto)
  contacts?: PartnerContactsDto | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  website?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Object)
  socialLinks?: Record<string, string> | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoMediaId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coverMediaId?: string | null;

  @ApiPropertyOptional({ type: PartnerProfileTranslationsDto })
  @IsOptional()
  @Type(() => PartnerProfileTranslationsDto)
  translations?: PartnerProfileTranslationsDto;
}
