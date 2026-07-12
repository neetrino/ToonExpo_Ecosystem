import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  MEDIA_PRESIGN_TTL_SECONDS,
  type MediaPresignRequest,
  type MediaPresignResponse,
} from '@toonexpo/contracts';

import { getR2S3Client } from './client';
import { getR2Config } from './get-r2-config';
import { buildMediaObjectKey } from './object-key';
import { buildPublicObjectUrl } from './r2-config';

export type CreateMediaPresignResult =
  { ok: true; data: MediaPresignResponse } | { ok: false; error: 'storageNotConfigured' };

/**
 * Issues a short-lived PUT URL scoped to `companyId`. Secrets never leave the server.
 */
export async function createMediaPresign(
  companyId: string,
  input: MediaPresignRequest,
): Promise<CreateMediaPresignResult> {
  const config = getR2Config();
  if (!config) {
    return { ok: false, error: 'storageNotConfigured' };
  }

  const objectKey = buildMediaObjectKey(companyId, input.contentType);
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
