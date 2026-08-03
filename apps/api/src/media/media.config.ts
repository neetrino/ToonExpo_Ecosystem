import type { ConfigService } from '@nestjs/config';
import { MediaAssetType } from '@toonexpo/db';

import type { AppEnv } from '../config/env.validation.js';
import {
  MEDIA_ALLOWED_MIME_TYPES,
  MEDIA_MIME_TO_EXT,
  MEDIA_MODEL3D_ALLOWED_EXTENSIONS,
  MEDIA_MODEL3D_ALLOWED_MIME_TYPES,
  MEDIA_MODEL3D_MIME_TO_EXT,
  MEDIA_MODEL3D_UPLOAD_MAX_BYTES,
  MEDIA_UPLOAD_MAX_BYTES,
  type MediaUploadKind,
} from './media.constants.js';

export type MediaKindUploadConfig = {
  maxBytes: number;
  allowedMimeTypes: readonly string[];
  mimeToExt: Record<string, string>;
  allowedExtensions: readonly string[];
  assetType: MediaAssetType;
  sizeLimitMessage: string;
  mimeRejectMessage: string;
};

export const MEDIA_KIND_UPLOAD_CONFIG: Record<MediaUploadKind, MediaKindUploadConfig> = {
  image: {
    maxBytes: MEDIA_UPLOAD_MAX_BYTES,
    allowedMimeTypes: MEDIA_ALLOWED_MIME_TYPES,
    mimeToExt: MEDIA_MIME_TO_EXT,
    allowedExtensions: Object.values(MEDIA_MIME_TO_EXT).map((ext) => `.${ext}`),
    assetType: MediaAssetType.image,
    sizeLimitMessage: 'Image exceeds the 10 MB upload limit',
    mimeRejectMessage: 'Only JPEG, PNG, WebP, and AVIF images are allowed',
  },
  model3d: {
    maxBytes: MEDIA_MODEL3D_UPLOAD_MAX_BYTES,
    allowedMimeTypes: MEDIA_MODEL3D_ALLOWED_MIME_TYPES,
    mimeToExt: MEDIA_MODEL3D_MIME_TO_EXT,
    allowedExtensions: MEDIA_MODEL3D_ALLOWED_EXTENSIONS,
    assetType: MediaAssetType.other,
    sizeLimitMessage: '3D model exceeds the 15 MB upload limit',
    mimeRejectMessage: 'Only GLB (.glb) files are allowed',
  },
};

export const resolveMediaKindConfig = (kind: MediaUploadKind): MediaKindUploadConfig =>
  MEDIA_KIND_UPLOAD_CONFIG[kind];

/**
 * True when all Cloudflare R2 env vars required for uploads are present.
 */
export const isR2Configured = (
  env: Pick<
    AppEnv,
    | 'R2_ACCOUNT_ID'
    | 'R2_ACCESS_KEY_ID'
    | 'R2_SECRET_ACCESS_KEY'
    | 'R2_BUCKET_NAME'
    | 'R2_PUBLIC_URL'
  >,
): boolean =>
  Boolean(
    env.R2_ACCOUNT_ID &&
    env.R2_ACCESS_KEY_ID &&
    env.R2_SECRET_ACCESS_KEY &&
    env.R2_BUCKET_NAME &&
    env.R2_PUBLIC_URL,
  );

export const isR2ConfiguredFromService = (configService: ConfigService<AppEnv, true>): boolean =>
  isR2Configured({
    R2_ACCOUNT_ID: configService.get('R2_ACCOUNT_ID', { infer: true }),
    R2_ACCESS_KEY_ID: configService.get('R2_ACCESS_KEY_ID', { infer: true }),
    R2_SECRET_ACCESS_KEY: configService.get('R2_SECRET_ACCESS_KEY', {
      infer: true,
    }),
    R2_BUCKET_NAME: configService.get('R2_BUCKET_NAME', { infer: true }),
    R2_PUBLIC_URL: configService.get('R2_PUBLIC_URL', { infer: true }),
  });

export const buildR2Endpoint = (accountId: string): string =>
  `https://${accountId}.r2.cloudflarestorage.com`;

export const buildObjectKey = (
  scope: 'company' | 'platform',
  assetId: string,
  extension: string,
  companyId?: string,
): string => {
  if (scope === 'company') {
    if (!companyId) {
      throw new Error('companyId is required for company-scoped media');
    }
    return `companies/${companyId}/${assetId}.${extension}`;
  }

  return `platform/${assetId}.${extension}`;
};

export const buildPublicFileUrl = (publicBaseUrl: string, key: string): string => {
  const base = publicBaseUrl.replace(/\/$/, '');
  return `${base}/${key}`;
};

export const sanitizeOriginalFilename = (filename: string): string => {
  const baseName = filename.split(/[/\\]/).pop() ?? 'upload';
  const trimmed = baseName.trim().slice(0, 200);
  return trimmed.length > 0 ? trimmed : 'upload';
};
