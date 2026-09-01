import {
  BadRequestException,
  Body,
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
import type {
  MediaAssetItem,
  MediaDirectUploadPresignResponse,
  MediaListResponse,
} from '@toonexpo/contracts';

import { AccountTypes } from '../../auth/decorators/account-types.decorator.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.js';
import { CompleteMediaUploadDto } from '../dto/complete-media-upload.dto.js';
import { ListMediaQueryDto } from '../dto/list-media.query.dto.js';
import { MediaUploadKindQueryDto } from '../dto/media-upload-kind.query.dto.js';
import { PresignMediaUploadDto } from '../dto/presign-media-upload.dto.js';
import { MEDIA_UPLOAD_FIELD_NAME, MEDIA_UPLOAD_INTERCEPTOR_MAX_BYTES } from '../media.constants.js';
import { MediaDirectUploadService } from '../media-direct-upload.service.js';
import { MediaUploadService } from '../media-upload.service.js';
import type { UploadedImageFile } from '../uploaded-file.type.js';

@ApiTags('admin-media')
@AccountTypes('platform_admin')
@Controller()
export class AdminMediaController {
  constructor(
    private readonly mediaUpload: MediaUploadService,
    private readonly mediaDirectUpload: MediaDirectUploadService,
  ) {}

  @Get('admin/media')
  @ApiOperation({ summary: 'List platform media assets' })
  @ApiOkResponse({ description: 'Paginated media list' })
  list(@Query() query: ListMediaQueryDto): Promise<MediaListResponse> {
    return this.mediaUpload.listPlatformMedia(query.page, query.pageSize);
  }

  @Post('admin/media/uploads/presign')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Presign a direct-to-R2 upload (model3d / GLB, up to 100 MB)',
  })
  @ApiOkResponse({ description: 'Presigned PUT URL + pending media asset id' })
  presign(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: PresignMediaUploadDto,
  ): Promise<MediaDirectUploadPresignResponse> {
    return this.mediaDirectUpload.presign({
      ...body,
      uploadedByUserId: user.id,
      scope: { kind: 'platform' },
    });
  }

  @Post('admin/media/uploads/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Finalize a direct-to-R2 upload after the browser PUT' })
  @ApiOkResponse({ description: 'Completed media asset' })
  complete(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CompleteMediaUploadDto,
  ): Promise<MediaAssetItem> {
    return this.mediaDirectUpload.complete({
      mediaAssetId: body.mediaAssetId,
      uploadedByUserId: user.id,
      scope: { kind: 'platform' },
    });
  }

  @Post('admin/media')
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary:
      'Upload a platform media file via multipart (images; model3d still accepted but prefer /uploads/presign)',
  })
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
