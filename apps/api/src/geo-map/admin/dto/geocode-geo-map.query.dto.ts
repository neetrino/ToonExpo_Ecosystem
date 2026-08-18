import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

import {
  GEO_MAP_GEOCODE_QUERY_MAX_LENGTH,
  GEO_MAP_GEOCODE_QUERY_MIN_LENGTH,
} from '../../geo-map.constants.js';

/**
 * Query for `GET /admin/geo-map/geocode`.
 */
export class GeocodeGeoMapQueryDto {
  @ApiProperty({
    minLength: GEO_MAP_GEOCODE_QUERY_MIN_LENGTH,
    maxLength: GEO_MAP_GEOCODE_QUERY_MAX_LENGTH,
  })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(GEO_MAP_GEOCODE_QUERY_MIN_LENGTH)
  @MaxLength(GEO_MAP_GEOCODE_QUERY_MAX_LENGTH)
  q!: string;
}
