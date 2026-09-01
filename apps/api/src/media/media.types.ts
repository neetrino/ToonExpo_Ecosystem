import type { MediaUploadKind } from './media.constants.js';

export const R2_STORAGE = Symbol('R2_STORAGE');

export type R2PresignedPut = {
  uploadUrl: string;
  expiresAt: Date;
};

export type R2ObjectHead = {
  contentLength: number | null;
  contentType: string | null;
};

export type R2StorageClient = {
  uploadObject: (key: string, body: Buffer, contentType: string) => Promise<void>;
  deleteObject: (key: string) => Promise<void>;
  createPresignedPutUrl: (
    key: string,
    contentType: string,
    expiresInSeconds: number,
  ) => Promise<R2PresignedPut>;
  headObject: (key: string) => Promise<R2ObjectHead | null>;
};

export type UploadedMediaScope = { kind: 'company'; companyId: string } | { kind: 'platform' };

export type { MediaUploadKind };
