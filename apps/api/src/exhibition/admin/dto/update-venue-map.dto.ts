import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateIf,
} from "class-validator";

const PUBLICATION_STATUSES = ["draft", "published", "archived"] as const;

export class UpdateVenueMapDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  mediaAssetId?: string;

  @IsOptional()
  @IsIn(PUBLICATION_STATUSES)
  publicationStatus?: (typeof PUBLICATION_STATUSES)[number];

  @IsOptional()
  @ValidateIf((_obj, value) => value != null)
  @IsInt()
  @Min(1)
  width?: number | null;

  @IsOptional()
  @ValidateIf((_obj, value) => value != null)
  @IsInt()
  @Min(1)
  height?: number | null;
}
