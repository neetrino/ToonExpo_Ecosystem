import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import {
  MEDIA_PRESIGN_TTL_SECONDS,
  type MediaPresignRequest,
  type MediaPresignResponse,
  type UploadPurpose,
} from '@toonexpo/contracts';

import { loadApiEnv } from '../../common/env';
import { buildUploadObjectKey, type UploadObjectScope } from './object-key';
import { getR2S3Client } from './r2-client';
import { buildPublicObjectUrl, resolveR2Config } from './r2-config';

export type CreateUploadPresignResult =
  { ok: true; data: MediaPresignResponse } | { ok: false; error: 'storageNotConfigured' };

@Injectable()
export class UploadsService {
  async createPresign(
    purpose: UploadPurpose,
    scope: UploadObjectScope,
    input: Pick<MediaPresignRequest, 'contentType' | 'contentLength'>,
  ): Promise<CreateUploadPresignResult> {
    const config = resolveR2Config(loadApiEnv());
    if (!config) {
      return { ok: false, error: 'storageNotConfigured' };
    }

    const objectKey = buildUploadObjectKey(purpose, scope, input.contentType);
    const expiresAt = new Date(Date.now() + MEDIA_PRESIGN_TTL_SECONDS * 1000);
    const client = getR2S3Client(config);
    const command = new PutObjectCommand({
      Bucket: config.bucketName,
      Key: objectKey,
      ContentType: input.contentType,
      ContentLength: input.contentLength,
    });

    const uploadUrl = await getSignedUrl(client, command, {
      expiresIn: MEDIA_PRESIGN_TTL_SECONDS,
    });

    return {
      ok: true,
      data: {
        uploadUrl,
        publicUrl: buildPublicObjectUrl(config.publicUrl, objectKey),
        objectKey,
        expiresAt: expiresAt.toISOString(),
      },
    };
  }
}
