import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
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

const PARTNER_TYPE_VALUES = new Set<string>(Object.values(PartnerCompanyTypeDto));
const MAX_PARTNER_TYPE_FILTER_VALUES = Object.values(PartnerCompanyTypeDto).length;

/**
 * Accepts `type=bank`, `type=bank,it_company`, or repeated `type` query values.
 */
const toPartnerTypeArray = (value: unknown): PartnerCompanyType[] | undefined => {
  if (value == null || value === '') {
    return undefined;
  }

  const raw = Array.isArray(value) ? value : String(value).split(',');
  const types = [
    ...new Set(
      raw
        .map((item) => String(item).trim())
        .filter((item) => PARTNER_TYPE_VALUES.has(item)),
    ),
  ] as PartnerCompanyType[];

  return types.length > 0 ? types : undefined;
};

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

  @ApiPropertyOptional({
    description: 'Partner types filter — one or more values (comma-separated or repeated).',
    enum: PartnerCompanyTypeDto,
    isArray: true,
    example: ['bank', 'it_company'],
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => toPartnerTypeArray(value))
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(MAX_PARTNER_TYPE_FILTER_VALUES)
  @IsEnum(PartnerCompanyTypeDto, { each: true })
  type?: PartnerCompanyType[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  featured?: boolean;
}

export class PublicPartnerSlugQueryDto extends CatalogLocaleQueryDto {}
