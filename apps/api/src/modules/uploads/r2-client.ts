import { S3Client } from '@aws-sdk/client-s3';

import type { R2Config } from './r2-config';

let cachedClient: { key: string; client: S3Client } | null = null;

function clientCacheKey(config: R2Config): string {
  return `${config.accountId}:${config.bucketName}:${config.accessKeyId}`;
}

export function getR2S3Client(config: R2Config): S3Client {
  const key = clientCacheKey(config);
  if (cachedClient?.key === key) {
    return cachedClient.client;
  }

  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
  cachedClient = { key, client };
  return client;
}

/** Test-only: clear the cached S3 client. */
export function resetR2S3ClientForTests(): void {
  cachedClient = null;
}
