import {
  BadRequestException,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { MediaAssetItem, MediaListResponse } from "@toonexpo/contracts";
import { MediaAssetType } from "@toonexpo/db";
import { imageSize } from "image-size";

import type { AppEnv } from "../config/env.validation.js";
import { PrismaService } from "../prisma/prisma.service.js";
import {
  MEDIA_ALLOWED_MIME_TYPES,
  MEDIA_DEFAULT_PAGE_SIZE,
  MEDIA_MAX_PAGE_SIZE,
  MEDIA_MIN_PAGE,
  MEDIA_MIME_TO_EXT,
  MEDIA_UPLOAD_MAX_BYTES,
  R2_NOT_CONFIGURED_MESSAGE,
  type MediaAllowedMimeType,
} from "./media.constants.js";
import {
  buildObjectKey,
  buildPublicFileUrl,
  isR2ConfiguredFromService,
  sanitizeOriginalFilename,
} from "./media.config.js";
import { toMediaAssetItem } from "./media.mapper.js";
import { R2_STORAGE, type R2StorageClient, type UploadedMediaScope } from "./media.types.js";

type UploadInput = {
  buffer: Buffer;
  mimeType: string;
  originalFilename: string;
  uploadedByUserId: string;
  scope: UploadedMediaScope;
};

@Injectable()
export class MediaUploadService {
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

  validateUpload(buffer: Buffer, mimeType: string): MediaAllowedMimeType {
    const normalizedMime = mimeType.trim().toLowerCase();
    if (
      !MEDIA_ALLOWED_MIME_TYPES.includes(normalizedMime as MediaAllowedMimeType)
    ) {
      throw new BadRequestException(
        "Only JPEG, PNG, WebP, and AVIF images are allowed",
      );
    }

    if (buffer.byteLength > MEDIA_UPLOAD_MAX_BYTES) {
      throw new BadRequestException("Image exceeds the 10 MB upload limit");
    }

    return normalizedMime as MediaAllowedMimeType;
  }

  async uploadImage(input: UploadInput): Promise<MediaAssetItem> {
    this.assertConfigured();

    const mimeType = this.validateUpload(input.buffer, input.mimeType);
    const dimensions = readImageDimensions(input.buffer);
    const extension = MEDIA_MIME_TO_EXT[mimeType];
    const ownerCompanyId =
      input.scope.kind === "company" ? input.scope.companyId : null;

    const draft = await this.prisma.db.mediaAsset.create({
      data: {
        ownerCompanyId,
        type: MediaAssetType.image,
        fileUrl: "pending",
        title: sanitizeOriginalFilename(input.originalFilename),
        width: dimensions?.width ?? null,
        height: dimensions?.height ?? null,
        uploadedByUserId: input.uploadedByUserId,
      },
    });

    const key = buildObjectKey(
      input.scope.kind === "company" ? "company" : "platform",
      draft.id,
      extension,
      ownerCompanyId ?? undefined,
    );
    const publicUrl = this.configService.get("R2_PUBLIC_URL", { infer: true });
    if (!publicUrl) {
      throw new ServiceUnavailableException(R2_NOT_CONFIGURED_MESSAGE);
    }

    const fileUrl = buildPublicFileUrl(publicUrl, key);

    try {
      await this.r2Storage!.uploadObject(key, input.buffer, mimeType);
      const asset = await this.prisma.db.mediaAsset.update({
        where: { id: draft.id },
        data: { fileUrl },
      });
      return toMediaAssetItem(asset);
    } catch (error) {
      await this.prisma.db.mediaAsset.delete({ where: { id: draft.id } });
      throw error;
    }
  }

  async listCompanyMedia(
    companyId: string,
    page: number,
    pageSize: number,
  ): Promise<MediaListResponse> {
    return this.listMedia({ ownerCompanyId: companyId }, page, pageSize);
  }

  async listPlatformMedia(
    page: number,
    pageSize: number,
  ): Promise<MediaListResponse> {
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
        orderBy: [{ createdAt: "desc" }],
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

const readImageDimensions = (
  buffer: Buffer,
): { width: number; height: number } | null => {
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
