import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

import { HOME_HERO_MAX_SLIDES } from '../../platform-settings.constants.js';

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
}
