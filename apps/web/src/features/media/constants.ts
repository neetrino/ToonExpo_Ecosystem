export const MEDIA_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;

export const MEDIA_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export type MediaAllowedMimeType = (typeof MEDIA_ALLOWED_MIME_TYPES)[number];

export const isAllowedMediaMimeType = (
  mimeType: string,
): mimeType is MediaAllowedMimeType =>
  MEDIA_ALLOWED_MIME_TYPES.includes(mimeType as MediaAllowedMimeType);
