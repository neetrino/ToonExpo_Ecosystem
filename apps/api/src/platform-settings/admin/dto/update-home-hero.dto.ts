import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import {
  HOME_HERO_MAX_SLIDES,
  HOME_HERO_SUBTITLE_MAX_LENGTH,
} from '../../platform-settings.constants.js';

export class HomeHeroLocaleTextDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(HOME_HERO_SUBTITLE_MAX_LENGTH)
  hy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(HOME_HERO_SUBTITLE_MAX_LENGTH)
  ru?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(HOME_HERO_SUBTITLE_MAX_LENGTH)
  en?: string;
}

export class UpdateHomeHeroDto {
  @ApiProperty({
    nullable: true,
    type: [String],
    description:
      'Ordered platform media asset ids for the home hero carousel; null or [] restores the default image',
  })
  @ValidateIf((_, value) => value !== null)
  @IsArray()
  @ArrayMaxSize(HOME_HERO_MAX_SLIDES)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  mediaAssetIds!: string[] | null;

  @ApiPropertyOptional({ type: HomeHeroLocaleTextDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => HomeHeroLocaleTextDto)
  title?: HomeHeroLocaleTextDto;

  @ApiPropertyOptional({ type: HomeHeroLocaleTextDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => HomeHeroLocaleTextDto)
  subtitle?: HomeHeroLocaleTextDto;
}
