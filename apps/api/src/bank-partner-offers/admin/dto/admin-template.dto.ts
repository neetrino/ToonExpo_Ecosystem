import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import { PublicationStatus } from "@toonexpo/db";

import {
  BANK_PARTNER_OFFER_NAME_MAX_LENGTH,
  BANK_PARTNER_OFFER_SORT_ORDER_MAX,
} from "../../bank-partner-offers.constants.js";

enum PublicationStatusDto {
  draft = "draft",
  published = "published",
  archived = "archived",
}

export class CreateBankPartnerOfferTemplateDto {
  @IsString()
  @MinLength(1)
  @MaxLength(BANK_PARTNER_OFFER_NAME_MAX_LENGTH)
  name!: string;

  @ApiPropertyOptional({ type: "object", additionalProperties: true })
  @IsOptional()
  @IsObject()
  fields?: Record<string, unknown>;

  @ApiPropertyOptional({ enum: PublicationStatusDto })
  @IsOptional()
  @IsEnum(PublicationStatusDto)
  publicationStatus?: PublicationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(BANK_PARTNER_OFFER_SORT_ORDER_MAX)
  sortOrder?: number;
}

export class UpdateBankPartnerOfferTemplateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(BANK_PARTNER_OFFER_NAME_MAX_LENGTH)
  name?: string;

  @ApiPropertyOptional({ type: "object", additionalProperties: true })
  @IsOptional()
  @IsObject()
  fields?: Record<string, unknown>;

  @ApiPropertyOptional({ enum: PublicationStatusDto })
  @IsOptional()
  @IsEnum(PublicationStatusDto)
  publicationStatus?: PublicationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(BANK_PARTNER_OFFER_SORT_ORDER_MAX)
  sortOrder?: number;
}

export class ListBankPartnerOfferTemplatesQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  partnerCompanyId?: string;

  @ApiPropertyOptional({ enum: PublicationStatusDto })
  @IsOptional()
  @IsEnum(PublicationStatusDto)
  publicationStatus?: PublicationStatus;

  @ApiPropertyOptional({
    description: "When true, return only published templates",
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  publishedOnly?: boolean;
}
