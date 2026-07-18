import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsDateString,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
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

export class CreatePortalProjectDto {
  @ApiProperty({ example: "Northern Hills" })
  @IsString()
  @MinLength(1)
  @MaxLength(PORTAL_PROJECT_NAME_MAX_LENGTH)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(PORTAL_SLUG_MAX_LENGTH)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(PORTAL_DESCRIPTION_MAX_LENGTH)
  shortDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(PORTAL_DESCRIPTION_MAX_LENGTH)
  fullDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(PORTAL_LOCATION_MAX_LENGTH)
  locationText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(PORTAL_ADDRESS_MAX_LENGTH)
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(PORTAL_CITY_MAX_LENGTH)
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(PORTAL_CITY_MAX_LENGTH)
  district?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  projectType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  constructionStatus?: string;

  @ApiPropertyOptional({ example: "2027-06-01" })
  @IsOptional()
  @IsDateString()
  completionDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  amenities?: unknown;

  @ApiPropertyOptional()
  @IsOptional()
  nearbyPlaces?: unknown;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coverMediaId?: string;

  @ApiPropertyOptional({ type: PortalTranslationsDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PortalTranslationsDto)
  translations?: PortalTranslationsDto;
}
