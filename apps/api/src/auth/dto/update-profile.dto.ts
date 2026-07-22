import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

import { NAME_MAX_LENGTH, PHONE_MAX_LENGTH } from '../../common/constants/app.constants.js';

/**
 * Self-service profile update — name and optional phone.
 */
export class UpdateProfileDto {
  @ApiProperty({ example: 'Ani Hakobyan' })
  @IsString()
  @MinLength(1)
  @MaxLength(NAME_MAX_LENGTH)
  name!: string;

  @ApiPropertyOptional({ example: '+37491111222', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(PHONE_MAX_LENGTH)
  @Matches(/^[+0-9()\-\s]*$/, {
    message: 'phone must contain digits and optional phone punctuation',
  })
  phone?: string;
}
