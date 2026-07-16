import { z } from 'zod';

/** Max upload size for signed image uploads (10 MiB). */
export const MEDIA_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;

/** Presigned PUT URL lifetime. */
export const MEDIA_PRESIGN_TTL_SECONDS = 10 * 60;

export const MEDIA_UPLOAD_ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export type MediaUploadMimeType = (typeof MEDIA_UPLOAD_ALLOWED_MIME_TYPES)[number];

export const MEDIA_UPLOAD_MIME_TO_EXT: Record<MediaUploadMimeType, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export const mediaUploadMimeTypeSchema = z.enum(MEDIA_UPLOAD_ALLOWED_MIME_TYPES);

/** Upload purposes — drives object-key prefix and route authz. */
export const UPLOAD_PURPOSES = ['MEDIA', 'COMPANY_LOGO', 'CANVAS_IMAGE', 'VENUE_IMAGE'] as const;

export type UploadPurpose = (typeof UPLOAD_PURPOSES)[number];

export const uploadPurposeSchema = z.enum(UPLOAD_PURPOSES);

/** Object-key path segment per purpose (under company or admin scope). */
export const UPLOAD_PURPOSE_KEY_PREFIX: Record<UploadPurpose, string> = {
  MEDIA: 'media',
  COMPANY_LOGO: 'logos',
  CANVAS_IMAGE: 'canvases',
  VENUE_IMAGE: 'venue',
};

export const mediaPresignRequestSchema = z.object({
  purpose: uploadPurposeSchema.default('MEDIA'),
  contentType: mediaUploadMimeTypeSchema,
  contentLength: z.number().int().positive().max(MEDIA_UPLOAD_MAX_BYTES),
});

export type MediaPresignRequest = z.infer<typeof mediaPresignRequestSchema>;

export const mediaPresignResponseSchema = z.object({
  uploadUrl: z.string().url(),
  publicUrl: z.string().url(),
  objectKey: z.string().min(1),
  expiresAt: z.string().datetime(),
});

export type MediaPresignResponse = z.infer<typeof mediaPresignResponseSchema>;

export const MEDIA_PRESIGN_ERROR_KEYS = [
  'unauthorized',
  'invalidInput',
  'rateLimited',
  'storageNotConfigured',
] as const;

export type MediaPresignErrorKey = (typeof MEDIA_PRESIGN_ERROR_KEYS)[number];

export const mediaPresignErrorSchema = z.object({
  error: z.enum(MEDIA_PRESIGN_ERROR_KEYS),
});

export type MediaPresignError = z.infer<typeof mediaPresignErrorSchema>;
