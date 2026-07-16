import {
  MEDIA_UPLOAD_MIME_TO_EXT,
  UPLOAD_PURPOSE_KEY_PREFIX,
  type MediaUploadMimeType,
  type UploadPurpose,
} from '@toonexpo/contracts';

const OBJECT_KEY_YEAR_PAD = 4;
const OBJECT_KEY_MONTH_PAD = 2;

export type UploadObjectScope =
  { kind: 'company'; companyId: string } | { kind: 'admin'; userId: string };

/**
 * Builds a scoped object key: `{prefix}/{scopeId}/…` or `admin/{userId}/{prefix}/…`.
 */
export function buildUploadObjectKey(
  purpose: UploadPurpose,
  scope: UploadObjectScope,
  contentType: MediaUploadMimeType,
  now: Date = new Date(),
  id: string = crypto.randomUUID(),
): string {
  const year = String(now.getUTCFullYear()).padStart(OBJECT_KEY_YEAR_PAD, '0');
  const month = String(now.getUTCMonth() + 1).padStart(OBJECT_KEY_MONTH_PAD, '0');
  const ext = MEDIA_UPLOAD_MIME_TO_EXT[contentType];
  const prefix = UPLOAD_PURPOSE_KEY_PREFIX[purpose];
  const leaf = `${year}/${month}/${id}.${ext}`;

  if (scope.kind === 'admin') {
    return `admin/${scope.userId}/${prefix}/${leaf}`;
  }

  return `${prefix}/${scope.companyId}/${leaf}`;
}

/**
 * Builds `media/{companyId}/{yyyy}/{mm}/{uuid}.{ext}` for a scoped media upload.
 * @deprecated Prefer {@link buildUploadObjectKey} with purpose `MEDIA`.
 */
export function buildMediaObjectKey(
  companyId: string,
  contentType: MediaUploadMimeType,
  now: Date = new Date(),
  id: string = crypto.randomUUID(),
): string {
  return buildUploadObjectKey('MEDIA', { kind: 'company', companyId }, contentType, now, id);
}
