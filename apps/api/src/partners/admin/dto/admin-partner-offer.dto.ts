import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import { PublicationStatus } from "@toonexpo/db";

enum PublicationStatusDto {
  draft = "draft",
  published = "published",
  archived = "archived",
}

export class PartnerOfferTranslationsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Object)
  title?: Record<string, string>;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Object)
  description?: Record<string, string>;
}

export class CreatePartnerOfferDto {
  @ApiPropertyOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(8000)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  type?: string;

  @ApiPropertyOptional({ enum: PublicationStatusDto })
  @IsOptional()
  @IsEnum(PublicationStatusDto)
  publicationStatus?: PublicationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(9999)
  sortOrder?: number;

  @ApiPropertyOptional({ type: PartnerOfferTranslationsDto })
  @IsOptional()
  @Type(() => PartnerOfferTranslationsDto)
  translations?: PartnerOfferTranslationsDto;
}

export class UpdatePartnerOfferDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(8000)
  description?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  type?: string | null;

  @ApiPropertyOptional({ enum: PublicationStatusDto })
  @IsOptional()
  @IsEnum(PublicationStatusDto)
  publicationStatus?: PublicationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(9999)
  sortOrder?: number;

  @ApiPropertyOptional({ type: PartnerOfferTranslationsDto })
  @IsOptional()
  @Type(() => PartnerOfferTranslationsDto)
  translations?: PartnerOfferTranslationsDto;
}
