import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { MediaAssetItem, MediaListResponse } from '@toonexpo/contracts';

import { AccountTypes } from '../../auth/decorators/account-types.decorator.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.js';
import { ListMediaQueryDto } from '../dto/list-media.query.dto.js';
import { MediaUploadKindQueryDto } from '../dto/media-upload-kind.query.dto.js';
import { MEDIA_UPLOAD_FIELD_NAME, MEDIA_UPLOAD_INTERCEPTOR_MAX_BYTES } from '../media.constants.js';
import { MediaUploadService } from '../media-upload.service.js';
import type { UploadedImageFile } from '../uploaded-file.type.js';

@ApiTags('admin-media')
@AccountTypes('platform_admin')
@Controller()
export class AdminMediaController {
  constructor(private readonly mediaUpload: MediaUploadService) {}

  @Get('admin/media')
  @ApiOperation({ summary: 'List platform media assets' })
  @ApiOkResponse({ description: 'Paginated media list' })
  list(@Query() query: ListMediaQueryDto): Promise<MediaListResponse> {
    return this.mediaUpload.listPlatformMedia(query.page, query.pageSize);
  }

  @Post('admin/media')
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a platform media file (image or model3d)' })
  @ApiCreatedResponse({ description: 'Uploaded media asset' })
  @UseInterceptors(
    FileInterceptor(MEDIA_UPLOAD_FIELD_NAME, {
      limits: { fileSize: MEDIA_UPLOAD_INTERCEPTOR_MAX_BYTES },
    }),
  )
  upload(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: MediaUploadKindQueryDto,
    @UploadedFile() file?: UploadedImageFile,
  ): Promise<MediaAssetItem> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const kind = this.mediaUpload.parseUploadKind(query.kind);

    return this.mediaUpload.upload({
      buffer: file.buffer,
      mimeType: file.mimetype,
      originalFilename: file.originalname,
      uploadedByUserId: user.id,
      scope: { kind: 'platform' },
      kind,
    });
  }
}
