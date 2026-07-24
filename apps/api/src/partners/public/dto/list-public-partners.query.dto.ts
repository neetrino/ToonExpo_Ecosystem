import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { PartnerCompanyType } from '@toonexpo/db';

import { CatalogLocaleQueryDto } from '../../../catalog/dto/catalog-locale.query.dto.js';
import {
  PARTNERS_DEFAULT_PAGE_SIZE,
  PARTNERS_MAX_PAGE_SIZE,
  PARTNERS_MIN_PAGE,
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

export class ListPublicPartnersQueryDto extends CatalogLocaleQueryDto {
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  featured?: boolean;
}

export class PublicPartnerSlugQueryDto extends CatalogLocaleQueryDto {}
