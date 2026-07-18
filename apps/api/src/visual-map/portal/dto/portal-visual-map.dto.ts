import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from "class-validator";

import {
  VISUAL_MAP_COORD_MAX,
  VISUAL_MAP_COORD_MIN,
} from "../../visual-map.constants.js";

enum VisualMapContextTypeDto {
  project = "project",
  building = "building",
  floor = "floor",
}

enum VisualHotspotTargetTypeDto {
  building = "building",
  floor = "floor",
  apartment = "apartment",
}

enum PublicationStatusDto {
  draft = "draft",
  published = "published",
  archived = "archived",
}

export class CreatePortalVisualCanvasDto {
  @ApiProperty({ enum: VisualMapContextTypeDto })
  @IsEnum(VisualMapContextTypeDto)
  contextType!: VisualMapContextTypeDto;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  contextId!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  mediaAssetId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}

export class UpdatePortalVisualCanvasDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mediaAssetId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ enum: PublicationStatusDto })
  @IsOptional()
  @IsEnum(PublicationStatusDto)
  publicationStatus?: PublicationStatusDto;
}

export class CreatePortalVisualHotspotDto {
  @ApiProperty({ enum: VisualHotspotTargetTypeDto })
  @IsEnum(VisualHotspotTargetTypeDto)
  targetType!: VisualHotspotTargetTypeDto;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  targetId!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  label!: string;

  @ApiProperty({ minimum: VISUAL_MAP_COORD_MIN, maximum: VISUAL_MAP_COORD_MAX })
  @Type(() => Number)
  @Min(VISUAL_MAP_COORD_MIN)
  @Max(VISUAL_MAP_COORD_MAX)
  xPercent!: number;

  @ApiProperty({ minimum: VISUAL_MAP_COORD_MIN, maximum: VISUAL_MAP_COORD_MAX })
  @Type(() => Number)
  @Min(VISUAL_MAP_COORD_MIN)
  @Max(VISUAL_MAP_COORD_MAX)
  yPercent!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  markerStyle?: string;

  @ApiPropertyOptional({ enum: PublicationStatusDto })
  @IsOptional()
  @IsEnum(PublicationStatusDto)
  publicationStatus?: PublicationStatusDto;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}

export class UpdatePortalVisualHotspotDto {
  @ApiPropertyOptional({ enum: VisualHotspotTargetTypeDto })
  @IsOptional()
  @IsEnum(VisualHotspotTargetTypeDto)
  targetType?: VisualHotspotTargetTypeDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  targetId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ minimum: VISUAL_MAP_COORD_MIN, maximum: VISUAL_MAP_COORD_MAX })
  @IsOptional()
  @Type(() => Number)
  @Min(VISUAL_MAP_COORD_MIN)
  @Max(VISUAL_MAP_COORD_MAX)
  xPercent?: number;

  @ApiPropertyOptional({ minimum: VISUAL_MAP_COORD_MIN, maximum: VISUAL_MAP_COORD_MAX })
  @IsOptional()
  @Type(() => Number)
  @Min(VISUAL_MAP_COORD_MIN)
  @Max(VISUAL_MAP_COORD_MAX)
  yPercent?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  markerStyle?: string;

  @ApiPropertyOptional({ enum: PublicationStatusDto })
  @IsOptional()
  @IsEnum(PublicationStatusDto)
  publicationStatus?: PublicationStatusDto;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}
