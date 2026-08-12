import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  Equals,
  IsArray,
  IsEnum,
  IsInt,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";

import {
  BOS_EVENT_CYCLE_MAX_LENGTH,
  BOS_REQUEST_ID_MAX_LENGTH,
  BOS_VENUE_MAP_BACKGROUND_URL_MAX_LENGTH,
  BOS_VENUE_MAP_CHECKSUM_LENGTH,
  BOS_VENUE_MAP_MAX_AREAS,
  BOS_VENUE_MAP_MAX_CELLS_PER_AREA,
  BOS_VENUE_MAP_SCHEMA_VERSION,
} from "../../integrations.constants.js";

const CHECKSUM_PATTERN = `^[a-fA-F0-9]{${BOS_VENUE_MAP_CHECKSUM_LENGTH}}$`;

enum VenueMapDisplayModeDto {
  organization = "organization",
  custom_label = "custom_label",
  hidden = "hidden",
}

export class BosVenueMapOccupantDto {
  @ApiPropertyOptional({ name: "toonexpo_company_id" })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(BOS_REQUEST_ID_MAX_LENGTH)
  toonexpo_company_id?: string;

  @ApiProperty({ name: "organization_name" })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  organization_name!: string;
}

export class BosVenueMapCellDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  x!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  y!: number;
}

export class BosVenueMapAreaDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  code!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiProperty({ name: "square_meters" })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  square_meters!: number;

  @ApiProperty({ type: [BosVenueMapCellDto] })
  @IsArray()
  @ArrayMaxSize(BOS_VENUE_MAP_MAX_CELLS_PER_AREA)
  @ValidateNested({ each: true })
  @Type(() => BosVenueMapCellDto)
  cells!: BosVenueMapCellDto[];

  @ApiProperty({ enum: VenueMapDisplayModeDto, name: "public_display_mode" })
  @IsEnum(VenueMapDisplayModeDto)
  public_display_mode!: VenueMapDisplayModeDto;

  @ApiPropertyOptional({ type: BosVenueMapOccupantDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BosVenueMapOccupantDto)
  occupant?: BosVenueMapOccupantDto;

  @ApiPropertyOptional({ name: "custom_label" })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  custom_label?: string;
}

export class BosVenueMapBackgroundDto {
  @ApiProperty()
  @IsUrl({ require_tld: false, protocols: ["http", "https"] })
  @MaxLength(BOS_VENUE_MAP_BACKGROUND_URL_MAX_LENGTH)
  url!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  width!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  height!: number;

  @ApiProperty({ name: "pixels_per_meter" })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  pixels_per_meter!: number;

  @ApiProperty({ name: "grid_origin_x" })
  @Type(() => Number)
  @IsInt()
  grid_origin_x!: number;

  @ApiProperty({ name: "grid_origin_y" })
  @Type(() => Number)
  @IsInt()
  grid_origin_y!: number;
}

export class BosVenueMapContentDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiProperty({ type: BosVenueMapBackgroundDto })
  @ValidateNested()
  @Type(() => BosVenueMapBackgroundDto)
  background!: BosVenueMapBackgroundDto;

  @ApiProperty({ type: [BosVenueMapAreaDto] })
  @IsArray()
  @ArrayMaxSize(BOS_VENUE_MAP_MAX_AREAS)
  @ValidateNested({ each: true })
  @Type(() => BosVenueMapAreaDto)
  areas!: BosVenueMapAreaDto[];
}

/**
 * BOS VenueMapSnapshotV1 wire payload (snake_case).
 */
export class BosVenueMapPublishRequestDto {
  @ApiProperty({ name: "request_id" })
  @IsString()
  @MinLength(1)
  @MaxLength(BOS_REQUEST_ID_MAX_LENGTH)
  request_id!: string;

  @ApiProperty({ name: "schema_version" })
  @Equals(BOS_VENUE_MAP_SCHEMA_VERSION)
  schema_version!: typeof BOS_VENUE_MAP_SCHEMA_VERSION;

  @ApiProperty({ name: "bos_venue_plan_id" })
  @IsString()
  @MinLength(1)
  @MaxLength(BOS_REQUEST_ID_MAX_LENGTH)
  bos_venue_plan_id!: string;

  @ApiProperty({ name: "bos_event_cycle_id" })
  @IsString()
  @MinLength(1)
  @MaxLength(BOS_EVENT_CYCLE_MAX_LENGTH)
  bos_event_cycle_id!: string;

  @ApiProperty({ name: "bos_event_cycle_code" })
  @IsString()
  @MinLength(1)
  @MaxLength(BOS_EVENT_CYCLE_MAX_LENGTH)
  bos_event_cycle_code!: string;

  @ApiProperty({ name: "snapshot_version" })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  snapshot_version!: number;

  @ApiProperty()
  @IsString()
  @Matches(CHECKSUM_PATTERN)
  checksum!: string;

  @ApiProperty({ name: "published_at" })
  @IsISO8601()
  published_at!: string;

  @ApiProperty({ type: BosVenueMapContentDto })
  @ValidateNested()
  @Type(() => BosVenueMapContentDto)
  content!: BosVenueMapContentDto;
}
