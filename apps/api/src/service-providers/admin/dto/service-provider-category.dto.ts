import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from "class-validator";

import {
  SERVICE_PROVIDER_CATEGORY_DESCRIPTION_MAX_LENGTH,
  SERVICE_PROVIDER_CATEGORY_NAME_MAX_LENGTH,
  SERVICE_PROVIDER_SORT_ORDER_MAX,
} from "../../service-providers.constants.js";

const optionalNullableString = () =>
  ValidateIf((_: unknown, value: unknown) => value !== null && value !== undefined);

export class CreateServiceProviderCategoryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(SERVICE_PROVIDER_CATEGORY_NAME_MAX_LENGTH)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(SERVICE_PROVIDER_CATEGORY_DESCRIPTION_MAX_LENGTH)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(SERVICE_PROVIDER_SORT_ORDER_MAX)
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  logoMediaId?: string;
}

export class UpdateServiceProviderCategoryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(SERVICE_PROVIDER_CATEGORY_NAME_MAX_LENGTH)
  name?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(SERVICE_PROVIDER_CATEGORY_DESCRIPTION_MAX_LENGTH)
  description?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(SERVICE_PROVIDER_SORT_ORDER_MAX)
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @optionalNullableString()
  @IsString()
  @MinLength(1)
  logoMediaId?: string | null;
}
