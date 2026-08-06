export const MEDIA_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;

export const MEDIA_MODEL3D_UPLOAD_MAX_BYTES = 15 * 1024 * 1024;

export const MEDIA_UPLOAD_FIELD_NAME = 'file';

export const MEDIA_DEFAULT_PAGE_SIZE = 24;

export const MEDIA_MAX_PAGE_SIZE = 100;

export const MEDIA_MIN_PAGE = 1;

export const MEDIA_UPLOAD_KINDS = ['image', 'model3d'] as const;

export type MediaUploadKind = (typeof MEDIA_UPLOAD_KINDS)[number];

export const MEDIA_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const;

export type MediaAllowedMimeType = (typeof MEDIA_ALLOWED_MIME_TYPES)[number];

export const MEDIA_MIME_TO_EXT: Record<MediaAllowedMimeType, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

/** Canonical MIME stored/uploaded for GLB assets. */
export const MEDIA_MODEL3D_CANONICAL_MIME = 'model/gltf-binary' as const;

/**
 * Browsers often send `.glb` as `application/octet-stream` or with an empty type.
 * Extension check still gates acceptance.
 */
export const MEDIA_MODEL3D_ALLOWED_MIME_TYPES = [
  MEDIA_MODEL3D_CANONICAL_MIME,
  'application/octet-stream',
] as const;

export type MediaModel3dMimeType = (typeof MEDIA_MODEL3D_ALLOWED_MIME_TYPES)[number];

export const MEDIA_MODEL3D_MIME_TO_EXT: Record<MediaModel3dMimeType, string> = {
  'model/gltf-binary': 'glb',
  'application/octet-stream': 'glb',
};

export const MEDIA_MODEL3D_ALLOWED_EXTENSIONS = ['.glb'] as const;

/** Largest per-kind limit — used by multipart interceptors before kind-specific checks. */
export const MEDIA_UPLOAD_INTERCEPTOR_MAX_BYTES = MEDIA_MODEL3D_UPLOAD_MAX_BYTES;

export const R2_REGION = 'auto';

export const R2_NOT_CONFIGURED_MESSAGE = 'Media upload is not configured';

/** Returned when R2 is configured but PutObject fails (credentials, bucket, network). */
export const R2_UPLOAD_FAILED_MESSAGE = 'Media storage upload failed';
