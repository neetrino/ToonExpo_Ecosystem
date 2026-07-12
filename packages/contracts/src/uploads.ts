import { z } from 'zod';

/** Max upload size for builder media (10 MiB). */
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

export const mediaPresignRequestSchema = z.object({
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
