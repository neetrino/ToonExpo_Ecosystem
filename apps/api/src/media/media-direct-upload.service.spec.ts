import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MediaAssetType } from '@toonexpo/db';

import type { PrismaService } from '../prisma/prisma.service.js';
import { MEDIA_PENDING_FILE_URL } from './media.constants.js';
import { MediaDirectUploadService } from './media-direct-upload.service.js';
import type { R2StorageClient } from './media.types.js';

describe('MediaDirectUploadService', () => {
  const mediaAssetCreate = vi.fn();
  const mediaAssetUpdate = vi.fn();
  const mediaAssetDelete = vi.fn();
  const mediaAssetFindFirst = vi.fn();
  const createPresignedPutUrl = vi.fn();
  const headObject = vi.fn();
  const deleteObject = vi.fn();
  const get = vi.fn();

  let service: MediaDirectUploadService;

  beforeEach(() => {
    vi.clearAllMocks();
    deleteObject.mockResolvedValue(undefined);
    mediaAssetDelete.mockResolvedValue(undefined);
    get.mockImplementation((key: string) => {
      const values: Record<string, string> = {
        R2_ACCOUNT_ID: 'acct',
        R2_ACCESS_KEY_ID: 'key',
        R2_SECRET_ACCESS_KEY: 'secret',
        R2_BUCKET_NAME: 'bucket',
        R2_PUBLIC_URL: 'https://cdn.example.com',
      };
      return values[key];
    });

    const r2Storage: R2StorageClient = {
      uploadObject: vi.fn(),
      deleteObject,
      createPresignedPutUrl,
      headObject,
    };

    service = new MediaDirectUploadService(
      {
        db: {
          mediaAsset: {
            create: mediaAssetCreate,
            update: mediaAssetUpdate,
            delete: mediaAssetDelete,
            findFirst: mediaAssetFindFirst,
          },
        },
      } as unknown as PrismaService,
      { get } as unknown as ConfigService,
      r2Storage,
    );
  });

  it('presigns a model3d upload and returns required Content-Type header', async () => {
    mediaAssetCreate.mockResolvedValue({
      id: 'media_1',
      type: MediaAssetType.other,
      fileUrl: MEDIA_PENDING_FILE_URL,
    });
    createPresignedPutUrl.mockResolvedValue({
      uploadUrl: 'https://r2.example/presigned',
      expiresAt: new Date('2026-09-01T12:15:00.000Z'),
    });

    const result = await service.presign({
      filename: 'tower.glb',
      byteSize: 50 * 1024 * 1024,
      kind: 'model3d',
      uploadedByUserId: 'user_1',
      scope: { kind: 'platform' },
    });

    expect(createPresignedPutUrl).toHaveBeenCalledWith(
      'platform/media_1.glb',
      'model/gltf-binary',
      15 * 60,
    );
    expect(result).toEqual({
      mediaAssetId: 'media_1',
      uploadUrl: 'https://r2.example/presigned',
      requiredHeaders: { 'Content-Type': 'model/gltf-binary' },
      expiresAt: '2026-09-01T12:15:00.000Z',
    });
  });

  it('rejects oversized presign requests', async () => {
    await expect(
      service.presign({
        filename: 'tower.glb',
        byteSize: 100 * 1024 * 1024 + 1,
        kind: 'model3d',
        uploadedByUserId: 'user_1',
        scope: { kind: 'platform' },
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(mediaAssetCreate).not.toHaveBeenCalled();
  });

  it('completes after verifying the object exists in R2', async () => {
    mediaAssetFindFirst.mockResolvedValue({
      id: 'media_1',
      uploadedByUserId: 'user_1',
      ownerCompanyId: null,
      fileUrl: MEDIA_PENDING_FILE_URL,
    });
    headObject.mockResolvedValue({ contentLength: 12_000_000, contentType: 'model/gltf-binary' });
    mediaAssetUpdate.mockResolvedValue({
      id: 'media_1',
      fileUrl: 'https://cdn.example.com/platform/media_1.glb',
      thumbnailUrl: null,
      title: 'tower.glb',
      width: null,
      height: null,
      createdAt: new Date('2026-09-01T12:00:00.000Z'),
    });

    const result = await service.complete({
      mediaAssetId: 'media_1',
      uploadedByUserId: 'user_1',
      scope: { kind: 'platform' },
    });

    expect(result.fileUrl).toContain('platform/media_1.glb');
    expect(mediaAssetUpdate).toHaveBeenCalled();
  });

  it('rejects complete when another user owns the pending upload', async () => {
    mediaAssetFindFirst.mockResolvedValue({
      id: 'media_1',
      uploadedByUserId: 'user_other',
      ownerCompanyId: null,
      fileUrl: MEDIA_PENDING_FILE_URL,
    });

    await expect(
      service.complete({
        mediaAssetId: 'media_1',
        uploadedByUserId: 'user_1',
        scope: { kind: 'platform' },
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects complete when the object is missing in R2', async () => {
    mediaAssetFindFirst.mockResolvedValue({
      id: 'media_1',
      uploadedByUserId: 'user_1',
      ownerCompanyId: null,
      fileUrl: MEDIA_PENDING_FILE_URL,
    });
    headObject.mockResolvedValue(null);

    await expect(
      service.complete({
        mediaAssetId: 'media_1',
        uploadedByUserId: 'user_1',
        scope: { kind: 'platform' },
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(deleteObject).toHaveBeenCalled();
    expect(mediaAssetDelete).toHaveBeenCalled();
  });

  it('returns 503 when R2 is not configured', async () => {
    const unconfigured = new MediaDirectUploadService(
      { db: { mediaAsset: {} } } as unknown as PrismaService,
      { get: vi.fn().mockReturnValue(undefined) } as unknown as ConfigService,
      null,
    );

    await expect(
      unconfigured.presign({
        filename: 'tower.glb',
        byteSize: 1000,
        kind: 'model3d',
        uploadedByUserId: 'user_1',
        scope: { kind: 'platform' },
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('returns 404 when pending upload is missing', async () => {
    mediaAssetFindFirst.mockResolvedValue(null);

    await expect(
      service.complete({
        mediaAssetId: 'missing',
        uploadedByUserId: 'user_1',
        scope: { kind: 'platform' },
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
