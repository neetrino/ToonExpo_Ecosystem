import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
  Min,
  Max,
} from 'class-validator';

import {
  GEO_MAP_LATITUDE_MAX,
  GEO_MAP_LATITUDE_MIN,
  GEO_MAP_LONGITUDE_MAX,
  GEO_MAP_LONGITUDE_MIN,
  GEO_MAP_MIN_ZOOM_MAX,
  GEO_MAP_MIN_ZOOM_MIN,
} from '../../geo-map.constants.js';

export class CreateGeoMapModelDto {
  @IsString()
  @MinLength(1)
  projectId!: string;

  @IsString()
  @MinLength(1)
  mediaAssetId!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 7 })
  @Min(GEO_MAP_LONGITUDE_MIN)
  @Max(GEO_MAP_LONGITUDE_MAX)
  longitude!: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 7 })
  @Min(GEO_MAP_LATITUDE_MIN)
  @Max(GEO_MAP_LATITUDE_MAX)
  latitude!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  altitudeM?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  headingDeg?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  pitchDeg?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  rollDeg?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 6 })
  @IsPositive()
  scale?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(GEO_MAP_MIN_ZOOM_MIN)
  @Max(GEO_MAP_MIN_ZOOM_MAX)
  minZoom?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateGeoMapModelDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  mediaAssetId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 7 })
  @Min(GEO_MAP_LONGITUDE_MIN)
  @Max(GEO_MAP_LONGITUDE_MAX)
  longitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 7 })
  @Min(GEO_MAP_LATITUDE_MIN)
  @Max(GEO_MAP_LATITUDE_MAX)
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  altitudeM?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  headingDeg?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  pitchDeg?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  rollDeg?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 6 })
  @IsPositive()
  scale?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(GEO_MAP_MIN_ZOOM_MIN)
  @Max(GEO_MAP_MIN_ZOOM_MAX)
  minZoom?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class GeoMapModelIdParamDto {
  @IsString()
  @MinLength(1)
  id!: string;
}
