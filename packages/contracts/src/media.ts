import type { PaginatedResponse } from "./catalog.js";

export type MediaAssetItem = {
  id: string;
  fileUrl: string;
  thumbnailUrl: string | null;
  title: string | null;
  width: number | null;
  height: number | null;
  createdAt: string;
};

export type MediaListResponse = PaginatedResponse<MediaAssetItem>;

export type ListMediaQuery = {
  page?: number;
  pageSize?: number;
};

/** Direct-to-R2 upload (bypasses Cloud Run 32 MB request body limit). */
export type MediaDirectUploadKind = 'model3d';

export type MediaDirectUploadPresignRequest = {
  filename: string;
  /** Declared file size in bytes; enforced again on complete via R2 HEAD. */
  byteSize: number;
  kind: MediaDirectUploadKind;
  /** Optional browser MIME; empty / octet-stream accepted for GLB. */
  contentType?: string;
};

export type MediaDirectUploadPresignResponse = {
  mediaAssetId: string;
  /** Presigned R2/S3 PUT URL (not the public CDN URL). */
  uploadUrl: string;
  /** Headers the browser MUST send on the PUT (signed). */
  requiredHeaders: {
    'Content-Type': string;
  };
  expiresAt: string;
};

export type MediaDirectUploadCompleteRequest = {
  mediaAssetId: string;
};
