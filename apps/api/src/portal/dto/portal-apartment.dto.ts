import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from "class-validator";

import {
  PORTAL_APARTMENT_NUMBER_MAX_LENGTH,
  PORTAL_BULK_APARTMENTS_MAX,
  PORTAL_DESCRIPTION_MAX_LENGTH,
  PORTAL_STATUS_REASON_MAX_LENGTH,
} from "../portal.constants.js";
import { PortalTranslationsDto } from "./portal-translations.dto.js";

enum SalesStatusDto {
  available = "available",
  reserved = "reserved",
  sold = "sold",
}

enum PriceVisibilityDto {
  public = "public",
  by_request = "by_request",
  visible_after_login = "visible_after_login",
}

export class CreatePortalApartmentDto {
  @ApiProperty({ example: "12A" })
  @IsString()
  @MinLength(1)
  @MaxLength(PORTAL_APARTMENT_NUMBER_MAX_LENGTH)
  number!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  rooms?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  bedrooms?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  bathrooms?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  areaTotal?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  areaLiving?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  balconyArea?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ enum: PriceVisibilityDto })
  @IsOptional()
  @IsEnum(PriceVisibilityDto)
  priceVisibility?: PriceVisibilityDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(PORTAL_DESCRIPTION_MAX_LENGTH)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  matterportUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  external3dUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  orientation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  viewType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  features?: unknown;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  planMediaId?: string;

  @ApiPropertyOptional({ enum: SalesStatusDto })
  @IsOptional()
  @IsEnum(SalesStatusDto)
  salesStatus?: SalesStatusDto;

  @ApiPropertyOptional({ type: PortalTranslationsDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PortalTranslationsDto)
  translations?: PortalTranslationsDto;
}

export class UpdatePortalApartmentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(PORTAL_APARTMENT_NUMBER_MAX_LENGTH)
  number?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsInt()
  @Min(0)
  rooms?: number | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsInt()
  @Min(0)
  bedrooms?: number | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsInt()
  @Min(0)
  bathrooms?: number | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsNumber()
  @Min(0)
  areaTotal?: number | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsNumber()
  @Min(0)
  areaLiving?: number | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsNumber()
  @Min(0)
  balconyArea?: number | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsNumber()
  @Min(0)
  price?: number | null;

  @ApiPropertyOptional({ enum: PriceVisibilityDto })
  @IsOptional()
  @IsEnum(PriceVisibilityDto)
  priceVisibility?: PriceVisibilityDto;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(PORTAL_DESCRIPTION_MAX_LENGTH)
  description?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(500)
  matterportUrl?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(500)
  external3dUrl?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(120)
  orientation?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(120)
  viewType?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  features?: unknown;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  planMediaId?: string | null;

  @ApiPropertyOptional({ enum: SalesStatusDto })
  @IsOptional()
  @IsEnum(SalesStatusDto)
  salesStatus?: SalesStatusDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(PORTAL_STATUS_REASON_MAX_LENGTH)
  statusChangeReason?: string;

  @ApiPropertyOptional({ type: PortalTranslationsDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PortalTranslationsDto)
  translations?: PortalTranslationsDto;
}

export class BulkCreatePortalApartmentsDto {
  @ApiProperty({ type: [CreatePortalApartmentDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(PORTAL_BULK_APARTMENTS_MAX)
  @ValidateNested({ each: true })
  @Type(() => CreatePortalApartmentDto)
  apartments!: CreatePortalApartmentDto[];
}
