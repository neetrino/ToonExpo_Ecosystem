import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';

import { getR2S3Client } from './r2-client';
import { resolveR2Config } from './r2-config';

@Injectable()
export class R2DeleteService {
  private readonly logger = new Logger(R2DeleteService.name);

  async delete(url: string | null | undefined): Promise<void> {
    const config = resolveR2Config(process.env);
    if (!config || !url) return;
    const prefix = `${config.publicUrl.replace(/\/+$/, '')}/`;
    if (!url.startsWith(prefix)) return;
    const key = url.slice(prefix.length);
    if (!key) return;
    try {
      await getR2S3Client(config).send(
        new DeleteObjectCommand({ Bucket: config.bucketName, Key: key }),
      );
    } catch (error) {
      this.logger.warn(`Failed to delete R2 object: ${errorMessage(error)}`);
    }
  }

  deleteReplaced(previousUrl: string | null, nextUrl: string | null): Promise<void> {
    if (!previousUrl || previousUrl === nextUrl) return Promise.resolve();
    return this.delete(previousUrl);
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
