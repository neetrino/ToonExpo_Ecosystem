import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { AppEnv } from '../config/env.validation.js';
import { R2_REGION } from './media.constants.js';
import { buildR2Endpoint } from './media.config.js';
import type { R2ObjectHead, R2PresignedPut, R2StorageClient } from './media.types.js';

@Injectable()
export class R2StorageService implements R2StorageClient {
  private readonly client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService<AppEnv, true>) {
    const accountId = this.configService.get('R2_ACCOUNT_ID', { infer: true });
    const accessKeyId = this.configService.get('R2_ACCESS_KEY_ID', {
      infer: true,
    });
    const secretAccessKey = this.configService.get('R2_SECRET_ACCESS_KEY', {
      infer: true,
    });
    const bucketName = this.configService.get('R2_BUCKET_NAME', { infer: true });

    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
      throw new Error('R2StorageService requires full R2 configuration');
    }

    this.bucketName = bucketName;
    this.client = new S3Client({
      region: R2_REGION,
      endpoint: buildR2Endpoint(accountId),
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadObject(key: string, body: Buffer, contentType: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
    );
  }

  async createPresignedPutUrl(
    key: string,
    contentType: string,
    expiresInSeconds: number,
  ): Promise<R2PresignedPut> {
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
    const uploadUrl = await getSignedUrl(
      this.client as never,
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
      }),
      { expiresIn: expiresInSeconds },
    );
    return { uploadUrl, expiresAt };
  }

  async headObject(key: string): Promise<R2ObjectHead | null> {
    try {
      const result = await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
      return {
        contentLength: result.ContentLength ?? null,
        contentType: result.ContentType ?? null,
      };
    } catch (error: unknown) {
      if (isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }
}

const isNotFoundError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') {
    return false;
  }
  const record = error as { name?: string; $metadata?: { httpStatusCode?: number } };
  return record.name === 'NotFound' || record.$metadata?.httpStatusCode === 404;
};
