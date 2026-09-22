import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CompleteMediaUploadDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  mediaAssetId!: string;
}
