import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { MediaAssetItem, MediaListResponse } from '@toonexpo/contracts';
import { imageSize } from 'image-size';

import type { AppEnv } from '../config/env.validation.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  MEDIA_DEFAULT_PAGE_SIZE,
  MEDIA_MAX_PAGE_SIZE,
  MEDIA_MIN_PAGE,
  MEDIA_MODEL3D_CANONICAL_MIME,
  MEDIA_UPLOAD_KINDS,
  R2_NOT_CONFIGURED_MESSAGE,
  R2_UPLOAD_FAILED_MESSAGE,
  type MediaUploadKind,
} from './media.constants.js';
import {
  buildObjectKey,
  buildPublicFileUrl,
  isR2ConfiguredFromService,
  resolveMediaKindConfig,
  sanitizeOriginalFilename,
  type MediaKindUploadConfig,
} from './media.config.js';
import { toMediaAssetItem } from './media.mapper.js';
import { R2_STORAGE, type R2StorageClient, type UploadedMediaScope } from './media.types.js';

type UploadInput = {
  buffer: Buffer;
  mimeType: string;
  originalFilename: string;
  uploadedByUserId: string;
  scope: UploadedMediaScope;
  kind?: MediaUploadKind;
};

type ValidatedUpload = {
  mimeType: string;
  extension: string;
  kind: MediaUploadKind;
};

@Injectable()
export class MediaUploadService {
  private readonly logger = new Logger(MediaUploadService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService<AppEnv, true>,
    @Inject(R2_STORAGE) private readonly r2Storage: R2StorageClient | null,
  ) {}

  assertConfigured(): void {
    if (!isR2ConfiguredFromService(this.configService) || !this.r2Storage) {
      throw new ServiceUnavailableException(R2_NOT_CONFIGURED_MESSAGE);
    }
  }

  parseUploadKind(rawKind: string | undefined): MediaUploadKind {
    const kind = (rawKind?.trim().toLowerCase() || 'image') as MediaUploadKind;
    if (!MEDIA_UPLOAD_KINDS.includes(kind)) {
      throw new BadRequestException(
        `Unsupported media upload kind. Allowed: ${MEDIA_UPLOAD_KINDS.join(', ')}`,
      );
    }
    return kind;
  }

  validateUpload(
    buffer: Buffer,
    mimeType: string,
    kind: MediaUploadKind = 'image',
    originalFilename?: string,
  ): ValidatedUpload {
    const config = resolveMediaKindConfig(kind);
    const normalizedMime = mimeType.trim().toLowerCase();

    if (kind === 'model3d') {
      return validateModel3dUpload(buffer, normalizedMime, originalFilename, config);
    }

    if (!config.allowedMimeTypes.includes(normalizedMime)) {
      throw new BadRequestException(config.mimeRejectMessage);
    }

    if (buffer.byteLength > config.maxBytes) {
      throw new BadRequestException(config.sizeLimitMessage);
    }

    const extension = config.mimeToExt[normalizedMime];
    if (!extension) {
      throw new BadRequestException(config.mimeRejectMessage);
    }

    return { mimeType: normalizedMime, extension, kind };
  }

  async uploadImage(input: UploadInput): Promise<MediaAssetItem> {
    return this.upload(input);
  }

  async upload(input: UploadInput): Promise<MediaAssetItem> {
    this.assertConfigured();

    const kind = input.kind ?? 'image';
    const validated = this.validateUpload(
      input.buffer,
      input.mimeType,
      kind,
      input.originalFilename,
    );
    const kindConfig = resolveMediaKindConfig(validated.kind);
    const dimensions = validated.kind === 'image' ? readImageDimensions(input.buffer) : null;
    const ownerCompanyId = input.scope.kind === 'company' ? input.scope.companyId : null;

    const draft = await this.prisma.db.mediaAsset.create({
      data: {
        ownerCompanyId,
        type: kindConfig.assetType,
        fileUrl: 'pending',
        title: sanitizeOriginalFilename(input.originalFilename),
        width: dimensions?.width ?? null,
        height: dimensions?.height ?? null,
        uploadedByUserId: input.uploadedByUserId,
      },
    });

    const key = buildObjectKey(
      input.scope.kind === 'company' ? 'company' : 'platform',
      draft.id,
      validated.extension,
      ownerCompanyId ?? undefined,
    );
    const publicUrl = this.configService.get('R2_PUBLIC_URL', { infer: true });
    if (!publicUrl) {
      throw new ServiceUnavailableException(R2_NOT_CONFIGURED_MESSAGE);
    }

    const fileUrl = buildPublicFileUrl(publicUrl, key);

    try {
      await this.r2Storage!.uploadObject(key, input.buffer, validated.mimeType);
      const asset = await this.prisma.db.mediaAsset.update({
        where: { id: draft.id },
        data: { fileUrl },
      });
      return toMediaAssetItem(asset);
    } catch (error) {
      await this.prisma.db.mediaAsset.delete({ where: { id: draft.id } }).catch(() => undefined);
      this.logger.error(
        { err: error, key, mimeType: validated.mimeType },
        'R2 media upload failed',
      );
      throw new ServiceUnavailableException(R2_UPLOAD_FAILED_MESSAGE);
    }
  }

  async listCompanyMedia(
    companyId: string,
    page: number,
    pageSize: number,
  ): Promise<MediaListResponse> {
    return this.listMedia({ ownerCompanyId: companyId }, page, pageSize);
  }

  async listPlatformMedia(page: number, pageSize: number): Promise<MediaListResponse> {
    return this.listMedia({ ownerCompanyId: null }, page, pageSize);
  }

  private async listMedia(
    where: { ownerCompanyId: string | null },
    pageInput: number,
    pageSizeInput: number,
  ): Promise<MediaListResponse> {
    this.assertConfigured();

    const page = Math.max(MEDIA_MIN_PAGE, pageInput);
    const pageSize = Math.min(
      MEDIA_MAX_PAGE_SIZE,
      Math.max(1, pageSizeInput || MEDIA_DEFAULT_PAGE_SIZE),
    );
    const skip = (page - 1) * pageSize;

    const [total, rows] = await Promise.all([
      this.prisma.db.mediaAsset.count({ where }),
      this.prisma.db.mediaAsset.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
        skip,
        take: pageSize,
      }),
    ]);

    return {
      data: rows.map(toMediaAssetItem),
      meta: {
        page,
        pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
      },
    };
  }
}

const validateModel3dUpload = (
  buffer: Buffer,
  normalizedMime: string,
  originalFilename: string | undefined,
  config: MediaKindUploadConfig,
): ValidatedUpload => {
  if (!originalFilename?.trim()) {
    throw new BadRequestException(config.mimeRejectMessage);
  }

  assertModel3dExtension(originalFilename, config.allowedExtensions);

  const mimeOk = normalizedMime.length === 0 || config.allowedMimeTypes.includes(normalizedMime);
  if (!mimeOk) {
    throw new BadRequestException(config.mimeRejectMessage);
  }

  if (buffer.byteLength > config.maxBytes) {
    throw new BadRequestException(config.sizeLimitMessage);
  }

  return {
    mimeType: MEDIA_MODEL3D_CANONICAL_MIME,
    extension: 'glb',
    kind: 'model3d',
  };
};

const assertModel3dExtension = (
  originalFilename: string,
  allowedExtensions: readonly string[],
): void => {
  const lower = originalFilename.trim().toLowerCase();
  const hasAllowedExt = allowedExtensions.some((ext) => lower.endsWith(ext));
  if (!hasAllowedExt) {
    throw new BadRequestException(`3D model must use extension ${allowedExtensions.join(', ')}`);
  }
};

const readImageDimensions = (buffer: Buffer): { width: number; height: number } | null => {
  try {
    const result = imageSize(buffer);
    if (result.width == null || result.height == null) {
      return null;
    }
    return { width: result.width, height: result.height };
  } catch {
    return null;
  }
};
