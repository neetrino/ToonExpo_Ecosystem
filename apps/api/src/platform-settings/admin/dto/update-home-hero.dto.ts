import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, ValidateIf } from 'class-validator';

export class UpdateHomeHeroDto {
  @ApiProperty({
    nullable: true,
    description: 'Platform media asset id, or null to restore the default hero image',
  })
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MinLength(1)
  mediaAssetId!: string | null;
}
