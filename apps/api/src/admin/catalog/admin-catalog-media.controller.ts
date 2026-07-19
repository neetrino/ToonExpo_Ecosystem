import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { ListMediaQueryDto } from '../../media/dto/list-media.query.dto.js';
import { MEDIA_UPLOAD_FIELD_NAME, MEDIA_UPLOAD_MAX_BYTES } from '../../media/media.constants.js';
import { MediaUploadService } from '../../media/media-upload.service.js';
import type { UploadedImageFile } from '../../media/uploaded-file.type.js';
import { AdminBuilderCompanyService } from './admin-builder-company.service.js';
import { AdminCatalogCompanyParamDto } from './dto/admin-catalog.param.dto.js';

@ApiTags('admin-company-media')
@AccountTypes('platform_admin')
@Controller('admin/companies/:companyId/catalog/media')
export class AdminCatalogMediaController {
  constructor(
    private readonly builderCompanies: AdminBuilderCompanyService,
    private readonly mediaUpload: MediaUploadService,
  ) {}

  @Get()
  @ApiOperation({ summary: "List a company's media assets (admin)" })
  @ApiOkResponse({ description: 'Paginated media list' })
  async list(
    @Param() params: AdminCatalogCompanyParamDto,
    @Query() query: ListMediaQueryDto,
  ): Promise<MediaListResponse> {
    const companyId = await this.builderCompanies.requireBuilderCompanyId(params.companyId);
    return this.mediaUpload.listCompanyMedia(companyId, query.page, query.pageSize);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload media on behalf of a company (admin)' })
  @ApiCreatedResponse({ description: 'Uploaded media asset' })
  @UseInterceptors(
    FileInterceptor(MEDIA_UPLOAD_FIELD_NAME, {
      limits: { fileSize: MEDIA_UPLOAD_MAX_BYTES },
    }),
  )
  async upload(
    @Param() params: AdminCatalogCompanyParamDto,
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file?: UploadedImageFile,
  ): Promise<MediaAssetItem> {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    const companyId = await this.builderCompanies.requireBuilderCompanyId(params.companyId);
    return this.mediaUpload.uploadImage({
      buffer: file.buffer,
      mimeType: file.mimetype,
      originalFilename: file.originalname,
      uploadedByUserId: user.id,
      scope: { kind: 'company', companyId },
    });
  }
}
