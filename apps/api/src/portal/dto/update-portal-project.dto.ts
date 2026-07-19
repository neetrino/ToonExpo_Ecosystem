import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsDateString,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
  ValidateNested,
} from "class-validator";

import {
  PORTAL_ADDRESS_MAX_LENGTH,
  PORTAL_CITY_MAX_LENGTH,
  PORTAL_DESCRIPTION_MAX_LENGTH,
  PORTAL_LOCATION_MAX_LENGTH,
  PORTAL_PROJECT_NAME_MAX_LENGTH,
  PORTAL_SLUG_MAX_LENGTH,
} from "../portal.constants.js";
import { PortalTranslationsDto } from "./portal-translations.dto.js";

export class UpdatePortalProjectDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(PORTAL_PROJECT_NAME_MAX_LENGTH)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(PORTAL_SLUG_MAX_LENGTH)
  slug?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(PORTAL_DESCRIPTION_MAX_LENGTH)
  shortDescription?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(PORTAL_DESCRIPTION_MAX_LENGTH)
  fullDescription?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(PORTAL_LOCATION_MAX_LENGTH)
  locationText?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(PORTAL_ADDRESS_MAX_LENGTH)
  address?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(PORTAL_CITY_MAX_LENGTH)
  city?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(PORTAL_CITY_MAX_LENGTH)
  district?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsNumber()
  latitude?: number | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsNumber()
  longitude?: number | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(120)
  projectType?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(120)
  constructionStatus?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsDateString()
  completionDate?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  amenities?: unknown;

  @ApiPropertyOptional()
  @IsOptional()
  nearbyPlaces?: unknown;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  coverMediaId?: string | null;

  @ApiPropertyOptional({ type: PortalTranslationsDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PortalTranslationsDto)
  translations?: PortalTranslationsDto;
}
