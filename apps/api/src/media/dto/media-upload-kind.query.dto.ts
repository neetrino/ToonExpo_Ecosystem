import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

import { MEDIA_UPLOAD_KINDS, type MediaUploadKind } from '../media.constants.js';

export class MediaUploadKindQueryDto {
  @ApiPropertyOptional({ enum: MEDIA_UPLOAD_KINDS, default: 'image' })
  @IsOptional()
  @IsString()
  @IsIn([...MEDIA_UPLOAD_KINDS])
  kind?: MediaUploadKind;
}
