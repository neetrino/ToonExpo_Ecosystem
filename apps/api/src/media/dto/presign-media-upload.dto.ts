import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

import {
  MEDIA_DIRECT_UPLOAD_KINDS,
  MEDIA_MODEL3D_UPLOAD_MAX_BYTES,
  type MediaDirectUploadKind,
} from '../media.constants.js';

export class PresignMediaUploadDto {
  @ApiProperty({ example: 'building.glb' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  filename!: string;

  @ApiProperty({ example: 12_000_000, description: 'Declared file size in bytes' })
  @IsInt()
  @Min(1)
  @Max(MEDIA_MODEL3D_UPLOAD_MAX_BYTES)
  byteSize!: number;

  @ApiProperty({ enum: MEDIA_DIRECT_UPLOAD_KINDS })
  @IsString()
  @IsIn([...MEDIA_DIRECT_UPLOAD_KINDS])
  kind!: MediaDirectUploadKind;

  @ApiPropertyOptional({ example: 'model/gltf-binary' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contentType?: string;
}
