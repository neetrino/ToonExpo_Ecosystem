import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  MediaAssetItem,
  MediaDirectUploadCompleteRequest,
  MediaDirectUploadPresignRequest,
  MediaDirectUploadPresignResponse,
} from '@toonexpo/contracts';

import type { AppEnv } from '../config/env.validation.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  MEDIA_DIRECT_UPLOAD_PRESIGN_TTL_SECONDS,
  MEDIA_MODEL3D_CANONICAL_MIME,
  MEDIA_PENDING_FILE_URL,
  R2_NOT_CONFIGURED_MESSAGE,
  R2_UPLOAD_FAILED_MESSAGE,
} from './media.constants.js';
import {
  buildObjectKey,
  buildPublicFileUrl,
  isR2ConfiguredFromService,
  resolveMediaKindConfig,
  sanitizeOriginalFilename,
} from './media.config.js';
import { toMediaAssetItem } from './media.mapper.js';
import { R2_STORAGE, type R2StorageClient, type UploadedMediaScope } from './media.types.js';

type PresignInput = MediaDirectUploadPresignRequest & {
  uploadedByUserId: string;
  scope: UploadedMediaScope;
};

type CompleteInput = MediaDirectUploadCompleteRequest & {
  uploadedByUserId: string;
  scope: UploadedMediaScope;
};

/**
 * Direct-to-R2 upload for large assets (GLB). Browser PUTs to a presigned URL
 * so Cloud Run's ~32 MB HTTP/1 body limit does not apply.
 */
@Injectable()
export class MediaDirectUploadService {
  private readonly logger = new Logger(MediaDirectUploadService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService<AppEnv, true>,
    @Inject(R2_STORAGE) private readonly r2Storage: R2StorageClient | null,
  ) {}

  async presign(input: PresignInput): Promise<MediaDirectUploadPresignResponse> {
    this.assertConfigured();
    if (input.kind !== 'model3d') {
      throw new BadRequestException('Direct upload currently supports kind=model3d only');
    }

    const config = resolveMediaKindConfig('model3d');
    assertModel3dFilename(input.filename, config.allowedExtensions);
    assertModel3dMime(input.contentType, config.allowedMimeTypes, config.mimeRejectMessage);

    if (input.byteSize > config.maxBytes) {
      throw new BadRequestException(config.sizeLimitMessage);
    }

    const ownerCompanyId = input.scope.kind === 'company' ? input.scope.companyId : null;
    const draft = await this.prisma.db.mediaAsset.create({
      data: {
        ownerCompanyId,
        type: config.assetType,
        fileUrl: MEDIA_PENDING_FILE_URL,
        title: sanitizeOriginalFilename(input.filename),
        uploadedByUserId: input.uploadedByUserId,
      },
    });

    const key = buildObjectKey(
      input.scope.kind === 'company' ? 'company' : 'platform',
      draft.id,
      'glb',
      ownerCompanyId ?? undefined,
    );

    try {
      const { uploadUrl, expiresAt } = await this.r2Storage!.createPresignedPutUrl(
        key,
        MEDIA_MODEL3D_CANONICAL_MIME,
        MEDIA_DIRECT_UPLOAD_PRESIGN_TTL_SECONDS,
      );

      return {
        mediaAssetId: draft.id,
        uploadUrl,
        requiredHeaders: { 'Content-Type': MEDIA_MODEL3D_CANONICAL_MIME },
        expiresAt: expiresAt.toISOString(),
      };
    } catch (error) {
      await this.prisma.db.mediaAsset.delete({ where: { id: draft.id } }).catch(() => undefined);
      this.logger.error({ err: error, key }, 'Failed to create R2 presigned PUT URL');
      throw new ServiceUnavailableException(R2_UPLOAD_FAILED_MESSAGE);
    }
  }

  async complete(input: CompleteInput): Promise<MediaAssetItem> {
    this.assertConfigured();

    const ownerCompanyId = input.scope.kind === 'company' ? input.scope.companyId : null;
    const draft = await this.prisma.db.mediaAsset.findFirst({
      where: {
        id: input.mediaAssetId,
        ownerCompanyId,
        fileUrl: MEDIA_PENDING_FILE_URL,
      },
    });

    if (!draft) {
      throw new NotFoundException('Pending media upload not found');
    }

    if (draft.uploadedByUserId !== input.uploadedByUserId) {
      throw new ForbiddenException('Only the uploader can complete this media upload');
    }

    const key = buildObjectKey(
      input.scope.kind === 'company' ? 'company' : 'platform',
      draft.id,
      'glb',
      ownerCompanyId ?? undefined,
    );

    const publicUrl = this.configService.get('R2_PUBLIC_URL', { infer: true });
    if (!publicUrl) {
      throw new ServiceUnavailableException(R2_NOT_CONFIGURED_MESSAGE);
    }

    const head = await this.r2Storage!.headObject(key);
    if (!head || head.contentLength == null || head.contentLength < 1) {
      await this.cleanupFailedUpload(draft.id, key);
      throw new BadRequestException('Upload not found in storage. Retry the upload.');
    }

    const maxBytes = resolveMediaKindConfig('model3d').maxBytes;
    if (head.contentLength > maxBytes) {
      await this.cleanupFailedUpload(draft.id, key);
      throw new BadRequestException(resolveMediaKindConfig('model3d').sizeLimitMessage);
    }

    const fileUrl = buildPublicFileUrl(publicUrl, key);
    const asset = await this.prisma.db.mediaAsset.update({
      where: { id: draft.id },
      data: { fileUrl },
    });

    return toMediaAssetItem(asset);
  }

  private assertConfigured(): void {
    if (!isR2ConfiguredFromService(this.configService) || !this.r2Storage) {
      throw new ServiceUnavailableException(R2_NOT_CONFIGURED_MESSAGE);
    }
  }

  private async cleanupFailedUpload(mediaAssetId: string, key: string): Promise<void> {
    if (this.r2Storage) {
      await this.r2Storage.deleteObject(key).catch(() => undefined);
    }
    await this.prisma.db.mediaAsset.delete({ where: { id: mediaAssetId } }).catch(() => undefined);
  }
}

const assertModel3dFilename = (
  filename: string,
  allowedExtensions: readonly string[],
): void => {
  const lower = filename.trim().toLowerCase();
  const hasAllowedExt = allowedExtensions.some((ext) => lower.endsWith(ext));
  if (!hasAllowedExt) {
    throw new BadRequestException(`3D model must use extension ${allowedExtensions.join(', ')}`);
  }
};

const assertModel3dMime = (
  contentType: string | undefined,
  allowedMimeTypes: readonly string[],
  rejectMessage: string,
): void => {
  const normalized = contentType?.trim().toLowerCase() ?? '';
  if (normalized.length > 0 && !allowedMimeTypes.includes(normalized)) {
    throw new BadRequestException(rejectMessage);
  }
};
