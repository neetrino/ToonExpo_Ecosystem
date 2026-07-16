import { DeleteObjectCommand } from '@aws-sdk/client-s3';

import { getR2S3Client } from './client';
import { getR2Config } from './get-r2-config';
import { objectKeyFromPublicUrl } from './r2-config';

/**
 * Best-effort R2 object delete when `url` is under `R2_PUBLIC_URL`.
 * Never throws — callers must not fail DB deletes on storage errors.
 */
export async function bestEffortDeleteR2Object(url: string): Promise<void> {
  const config = getR2Config();
  if (!config) {
    return;
  }

  const objectKey = objectKeyFromPublicUrl(config.publicUrl, url);
  if (!objectKey) {
    return;
  }

  try {
    const client = getR2S3Client(config);
    await client.send(
      new DeleteObjectCommand({
        Bucket: config.bucketName,
        Key: objectKey,
      }),
    );
  } catch (error) {
    console.warn('[storage] Failed to delete R2 object (continuing)', error);
  }
}

/**
 * Deletes the previous R2 object when a URL field is replaced or cleared.
 */
export async function bestEffortDeleteReplacedR2Object(
  previousUrl: string | null | undefined,
  nextUrl: string | null | undefined,
): Promise<void> {
  if (!previousUrl || previousUrl === nextUrl) {
    return;
  }
  await bestEffortDeleteR2Object(previousUrl);
}
