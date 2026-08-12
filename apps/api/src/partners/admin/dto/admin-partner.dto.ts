import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { PartnerCompanyStatus, PartnerCompanyType, PublicationStatus } from '@toonexpo/db';

import {
  COMPANY_NAME_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  PHONE_MAX_LENGTH,
} from '../../../common/constants/app.constants.js';
import {
  PARTNERS_DEFAULT_PAGE_SIZE,
  PARTNERS_MAX_PAGE_SIZE,
  PARTNERS_MIN_PAGE,
  PARTNER_SEARCH_MIN_LENGTH,
} from '../../partners.constants.js';

enum PartnerCompanyTypeDto {
  builder = 'builder',
  bank = 'bank',
  it_company = 'it_company',
  sponsor = 'sponsor',
  supplier = 'supplier',
  insurance = 'insurance',
  legal = 'legal',
  design_furniture = 'design_furniture',
  service_company = 'service_company',
  other = 'other',
}

/** Selectable types when provisioning a new partner (builder is not a partner profile type). */
enum CreatePartnerCompanyTypeDto {
  bank = 'bank',
  it_company = 'it_company',
  sponsor = 'sponsor',
  supplier = 'supplier',
  insurance = 'insurance',
  legal = 'legal',
  design_furniture = 'design_furniture',
  service_company = 'service_company',
  other = 'other',
}

enum PartnerCompanyStatusDto {
  active = 'active',
  inactive = 'inactive',
}

enum PublicationStatusDto {
  draft = 'draft',
  published = 'published',
  archived = 'archived',
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
  type?: PartnerCompanyType;

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
  @ApiProperty({ example: 'Ameriabank' })
  @IsString()
  @MinLength(1)
  @MaxLength(COMPANY_NAME_MAX_LENGTH)
  name!: string;

  @ApiProperty({ enum: CreatePartnerCompanyTypeDto })
  @IsEnum(CreatePartnerCompanyTypeDto)
  type!: PartnerCompanyType;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(1)
  @MaxLength(NAME_MAX_LENGTH)
  adminName!: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  @MaxLength(EMAIL_MAX_LENGTH)
  adminEmail!: string;

  @ApiPropertyOptional({ example: '+37491111222' })
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(PHONE_MAX_LENGTH)
  adminPhone?: string;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(8)
  locale?: string;
}

export class UpdateAdminPartnerDto {
  @ApiPropertyOptional({ enum: PartnerCompanyTypeDto })
  @IsOptional()
  @IsEnum(PartnerCompanyTypeDto)
  type?: PartnerCompanyType;

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
