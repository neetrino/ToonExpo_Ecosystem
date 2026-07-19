export const MEDIA_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;

export const MEDIA_UPLOAD_FIELD_NAME = "file";

export const MEDIA_DEFAULT_PAGE_SIZE = 24;

export const MEDIA_MAX_PAGE_SIZE = 100;

export const MEDIA_MIN_PAGE = 1;

export const MEDIA_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export type MediaAllowedMimeType = (typeof MEDIA_ALLOWED_MIME_TYPES)[number];

export const MEDIA_MIME_TO_EXT: Record<MediaAllowedMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export const R2_REGION = "auto";

export const R2_NOT_CONFIGURED_MESSAGE = "Media upload is not configured";
