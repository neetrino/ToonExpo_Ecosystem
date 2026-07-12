import { MEDIA_UPLOAD_MIME_TO_EXT, type MediaUploadMimeType } from '@toonexpo/contracts';

const OBJECT_KEY_YEAR_PAD = 4;
const OBJECT_KEY_MONTH_PAD = 2;

/**
 * Builds `media/{companyId}/{yyyy}/{mm}/{uuid}.{ext}` for a scoped upload.
 */
export function buildMediaObjectKey(
  companyId: string,
  contentType: MediaUploadMimeType,
  now: Date = new Date(),
  id: string = crypto.randomUUID(),
): string {
  const year = String(now.getUTCFullYear()).padStart(OBJECT_KEY_YEAR_PAD, '0');
  const month = String(now.getUTCMonth() + 1).padStart(OBJECT_KEY_MONTH_PAD, '0');
  const ext = MEDIA_UPLOAD_MIME_TO_EXT[contentType];
  return `media/${companyId}/${year}/${month}/${id}.${ext}`;
}
