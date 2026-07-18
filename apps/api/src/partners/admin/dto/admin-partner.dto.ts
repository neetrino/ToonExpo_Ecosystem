import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import { PartnerCompanyStatus, PublicationStatus } from "@toonexpo/db";

import {
  PARTNERS_DEFAULT_PAGE_SIZE,
  PARTNERS_MAX_PAGE_SIZE,
  PARTNERS_MIN_PAGE,
  PARTNER_SEARCH_MIN_LENGTH,
} from "../../partners.constants.js";

enum PartnerCompanyTypeDto {
  bank = "bank",
  it_company = "it_company",
  sponsor = "sponsor",
  supplier = "supplier",
  insurance = "insurance",
  legal = "legal",
  design_furniture = "design_furniture",
  service_company = "service_company",
  other = "other",
}

enum PartnerCompanyStatusDto {
  active = "active",
  inactive = "inactive",
}

enum PublicationStatusDto {
  draft = "draft",
  published = "published",
  archived = "archived",
}

export class ListAdminPartnersQueryDto {
  @ApiPropertyOptional({ default: PARTNERS_MIN_PAGE })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(PARTNERS_MIN_PAGE)
  page: number = PARTNERS_MIN_PAGE;

  @ApiPropertyOptional({ default: PARTNERS_DEFAULT_PAGE_SIZE })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(PARTNERS_MAX_PAGE_SIZE)
  pageSize: number = PARTNERS_DEFAULT_PAGE_SIZE;

  @ApiPropertyOptional({ enum: PartnerCompanyTypeDto })
  @IsOptional()
  @IsEnum(PartnerCompanyTypeDto)
  type?: PartnerCompanyTypeDto;

  @ApiPropertyOptional({ enum: PartnerCompanyStatusDto })
  @IsOptional()
  @IsEnum(PartnerCompanyStatusDto)
  status?: PartnerCompanyStatusDto;

  @ApiPropertyOptional({ enum: PublicationStatusDto })
  @IsOptional()
  @IsEnum(PublicationStatusDto)
  publicationStatus?: PublicationStatusDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(PARTNER_SEARCH_MIN_LENGTH)
  @MaxLength(200)
  search?: string;
}

export class PartnerContactsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(320)
  email?: string;
}

export class PartnerProfileTranslationsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Object)
  shortDescription?: Record<string, string>;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Object)
  fullDescription?: Record<string, string>;
}

export class CreateAdminPartnerDto {
  @ApiPropertyOptional()
  @IsString()
  @MinLength(1)
  companyId!: string;

  @ApiPropertyOptional({ enum: PartnerCompanyTypeDto })
  @IsEnum(PartnerCompanyTypeDto)
  type!: PartnerCompanyTypeDto;

  @ApiPropertyOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoMediaId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coverMediaId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(8000)
  shortDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(8000)
  fullDescription?: string;

  @ApiPropertyOptional({ type: PartnerContactsDto })
  @IsOptional()
  @Type(() => PartnerContactsDto)
  contacts?: PartnerContactsDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  website?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Object)
  socialLinks?: Record<string, string>;

  @ApiPropertyOptional({ enum: PartnerCompanyStatusDto })
  @IsOptional()
  @IsEnum(PartnerCompanyStatusDto)
  status?: PartnerCompanyStatusDto;

  @ApiPropertyOptional({ enum: PublicationStatusDto })
  @IsOptional()
  @IsEnum(PublicationStatusDto)
  publicationStatus?: PublicationStatusDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({ type: PartnerProfileTranslationsDto })
  @IsOptional()
  @Type(() => PartnerProfileTranslationsDto)
  translations?: PartnerProfileTranslationsDto;
}

export class UpdateAdminPartnerDto {
  @ApiPropertyOptional({ enum: PartnerCompanyTypeDto })
  @IsOptional()
  @IsEnum(PartnerCompanyTypeDto)
  type?: PartnerCompanyTypeDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoMediaId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coverMediaId?: string | null;

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

  @ApiPropertyOptional({ enum: PartnerCompanyStatusDto })
  @IsOptional()
  @IsEnum(PartnerCompanyStatusDto)
  status?: PartnerCompanyStatus;

  @ApiPropertyOptional({ enum: PublicationStatusDto })
  @IsOptional()
  @IsEnum(PublicationStatusDto)
  publicationStatus?: PublicationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({ type: PartnerProfileTranslationsDto })
  @IsOptional()
  @Type(() => PartnerProfileTranslationsDto)
  translations?: PartnerProfileTranslationsDto;
}
