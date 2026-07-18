import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { PublicationStatus, ServiceProviderType } from "@toonexpo/db";

import {
  SERVICE_PROVIDER_DESCRIPTION_MAX_LENGTH,
  SERVICE_PROVIDER_EMAIL_MAX_LENGTH,
  SERVICE_PROVIDER_INTERNAL_NOTES_MAX_LENGTH,
  SERVICE_PROVIDER_MAX_CATEGORY_IDS,
  SERVICE_PROVIDER_NAME_MAX_LENGTH,
  SERVICE_PROVIDER_PHONE_MAX_LENGTH,
  SERVICE_PROVIDER_SEARCH_MAX_LENGTH,
  SERVICE_PROVIDER_SERVICES_MAX_LENGTH,
  SERVICE_PROVIDER_WEBSITE_MAX_LENGTH,
} from "../../service-providers.constants.js";

enum ServiceProviderTypeDto {
  company = "company",
  person = "person",
  team = "team",
  other = "other",
}

enum PublicationStatusDto {
  draft = "draft",
  published = "published",
  archived = "archived",
}

export class CreateServiceProviderDto {
  @IsString()
  @MinLength(1)
  @MaxLength(SERVICE_PROVIDER_NAME_MAX_LENGTH)
  name!: string;

  @IsEnum(ServiceProviderTypeDto)
  providerType!: ServiceProviderType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(SERVICE_PROVIDER_DESCRIPTION_MAX_LENGTH)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(SERVICE_PROVIDER_SERVICES_MAX_LENGTH)
  services?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(SERVICE_PROVIDER_PHONE_MAX_LENGTH)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(SERVICE_PROVIDER_EMAIL_MAX_LENGTH)
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(SERVICE_PROVIDER_WEBSITE_MAX_LENGTH)
  website?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Object)
  socialLinks?: Record<string, string>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(SERVICE_PROVIDER_INTERNAL_NOTES_MAX_LENGTH)
  internalNotes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ enum: PublicationStatusDto })
  @IsOptional()
  @IsEnum(PublicationStatusDto)
  publicationStatus?: PublicationStatus;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(SERVICE_PROVIDER_MAX_CATEGORY_IDS)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  categoryIds?: string[];
}

export class UpdateServiceProviderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(SERVICE_PROVIDER_NAME_MAX_LENGTH)
  name?: string;

  @ApiPropertyOptional({ enum: ServiceProviderTypeDto })
  @IsOptional()
  @IsEnum(ServiceProviderTypeDto)
  providerType?: ServiceProviderType;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(SERVICE_PROVIDER_DESCRIPTION_MAX_LENGTH)
  description?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(SERVICE_PROVIDER_SERVICES_MAX_LENGTH)
  services?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(SERVICE_PROVIDER_PHONE_MAX_LENGTH)
  phone?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(SERVICE_PROVIDER_EMAIL_MAX_LENGTH)
  email?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(SERVICE_PROVIDER_WEBSITE_MAX_LENGTH)
  website?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @Type(() => Object)
  socialLinks?: Record<string, string> | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(SERVICE_PROVIDER_INTERNAL_NOTES_MAX_LENGTH)
  internalNotes?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ enum: PublicationStatusDto, nullable: true })
  @IsOptional()
  @IsEnum(PublicationStatusDto)
  publicationStatus?: PublicationStatus | null;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(SERVICE_PROVIDER_MAX_CATEGORY_IDS)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  categoryIds?: string[];
}

export class ListAdminServiceProvidersQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  active?: boolean;

  @ApiPropertyOptional({ enum: ServiceProviderTypeDto })
  @IsOptional()
  @IsEnum(ServiceProviderTypeDto)
  providerType?: ServiceProviderType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(SERVICE_PROVIDER_SEARCH_MAX_LENGTH)
  search?: string;
}

export class ListPortalServiceProvidersQueryDto {
  @IsString()
  @MinLength(1)
  categoryId!: string;
}
