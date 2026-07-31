import {
  GEO_MAP_GLB_ALLOWED_MIME_TYPES,
  GEO_MAP_GLB_EXTENSION,
  GEO_MAP_GLB_MAX_BYTES,
} from '@/features/geo-map/admin/constants';

export type GlbValidationErrorCode = 'type' | 'size';

/**
 * Client-side GLB gate before `POST /admin/media?kind=model3d`.
 * Prefer extension (browsers often leave `file.type` empty for `.glb`).
 */
export const validateGlbFile = (file: File): GlbValidationErrorCode | null => {
  const name = file.name.trim().toLowerCase();
  if (!name.endsWith(GEO_MAP_GLB_EXTENSION)) {
    return 'type';
  }

  const mime = file.type.trim().toLowerCase();
  if (
    mime.length > 0 &&
    !GEO_MAP_GLB_ALLOWED_MIME_TYPES.includes(
      mime as (typeof GEO_MAP_GLB_ALLOWED_MIME_TYPES)[number],
    )
  ) {
    return 'type';
  }

  if (file.size > GEO_MAP_GLB_MAX_BYTES) {
    return 'size';
  }

  return null;
};
