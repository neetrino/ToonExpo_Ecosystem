'use client';

import {
  MEDIA_UPLOAD_ALLOWED_MIME_TYPES,
  MEDIA_UPLOAD_MAX_BYTES,
  mediaPresignResponseSchema,
  type MediaUploadMimeType,
  type UploadPurpose,
} from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useId, useState, type ChangeEvent } from 'react';

const ACCEPT_ATTR = MEDIA_UPLOAD_ALLOWED_MIME_TYPES.join(',');

const UPLOAD_ERROR_KEYS = [
  'storageNotConfigured',
  'rateLimited',
  'unauthorized',
  'uploadFailed',
  'unsupportedType',
  'fileTooLarge',
] as const;

type UploadErrorKey = (typeof UPLOAD_ERROR_KEYS)[number];
type UploadStatus = 'idle' | 'presigning' | 'uploading' | 'ready' | 'error';

export type ImageUploadFieldProps = {
  /** Form field name written to the hidden + fallback URL inputs. */
  name: string;
  purpose: UploadPurpose;
  initialUrl: string;
  required?: boolean;
  maxLength?: number;
  /** next-intl namespace that owns upload field strings (default: common.imageUpload). */
  i18nNamespace?: string;
};

function isAllowedMime(type: string): type is MediaUploadMimeType {
  return (MEDIA_UPLOAD_ALLOWED_MIME_TYPES as readonly string[]).includes(type);
}

function toUploadErrorKey(key: string): UploadErrorKey {
  return (UPLOAD_ERROR_KEYS as readonly string[]).includes(key)
    ? (key as UploadErrorKey)
    : 'uploadFailed';
}

function mapPresignHttpError(status: number, bodyError: string | undefined): UploadErrorKey {
  if (status === 503 || bodyError === 'storageNotConfigured') {
    return 'storageNotConfigured';
  }
  if (status === 429 || bodyError === 'rateLimited') {
    return 'rateLimited';
  }
  if (status === 401 || bodyError === 'unauthorized') {
    return 'unauthorized';
  }
  return 'uploadFailed';
}

async function requestPresign(
  purpose: UploadPurpose,
  file: File,
): Promise<
  { ok: true; uploadUrl: string; publicUrl: string } | { ok: false; errorKey: UploadErrorKey }
> {
  const response = await fetch('/api/uploads/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      purpose,
      contentType: file.type,
      contentLength: file.size,
    }),
  });

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const bodyError =
      payload && typeof payload === 'object' && 'error' in payload
        ? String((payload as { error: unknown }).error)
        : undefined;
    return { ok: false, errorKey: mapPresignHttpError(response.status, bodyError) };
  }

  const parsed = mediaPresignResponseSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, errorKey: 'uploadFailed' };
  }

  return {
    ok: true,
    uploadUrl: parsed.data.uploadUrl,
    publicUrl: parsed.data.publicUrl,
  };
}

function validateSelectedFile(file: File): UploadErrorKey | null {
  if (!isAllowedMime(file.type)) {
    return 'unsupportedType';
  }
  if (file.size > MEDIA_UPLOAD_MAX_BYTES) {
    return 'fileTooLarge';
  }
  return null;
}

/**
 * Shared image upload control: file → R2 presign PUT, with collapsed URL paste fallback.
 */
export function ImageUploadField({
  name,
  purpose,
  initialUrl,
  required = false,
  maxLength,
  i18nNamespace = 'common.imageUpload',
}: ImageUploadFieldProps) {
  const t = useTranslations(i18nNamespace);
  const fileInputId = useId();
  const urlFallbackId = useId();
  const [url, setUrl] = useState(initialUrl);
  const [status, setStatus] = useState<UploadStatus>(initialUrl ? 'ready' : 'idle');
  const [errorKey, setErrorKey] = useState<UploadErrorKey | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }

    const validationError = validateSelectedFile(file);
    if (validationError) {
      setStatus('error');
      setErrorKey(validationError);
      return;
    }

    setFileName(file.name);
    setErrorKey(null);
    setStatus('presigning');

    try {
      const presign = await requestPresign(purpose, file);
      if (!presign.ok) {
        setStatus('error');
        setErrorKey(toUploadErrorKey(presign.errorKey));
        return;
      }

      setStatus('uploading');
      const putResponse = await fetch(presign.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!putResponse.ok) {
        setStatus('error');
        setErrorKey('uploadFailed');
        return;
      }

      setUrl(presign.publicUrl);
      setStatus('ready');
    } catch {
      setStatus('error');
      setErrorKey('uploadFailed');
    }
  }

  const busy = status === 'presigning' || status === 'uploading';

  return (
    <div className="portal-form__upload">
      <label className="portal-form__field" htmlFor={fileInputId}>
        <span className="portal-form__label">{t('fields.file')}</span>
        <input
          id={fileInputId}
          className="portal-form__file"
          type="file"
          accept={ACCEPT_ATTR}
          disabled={busy}
          onChange={handleFileChange}
        />
        <span className="portal-form__hint">{t('fields.fileHint')}</span>
      </label>

      {busy ? <p className="portal-form__hint">{t(`uploadStatus.${status}`)}</p> : null}
      {status === 'ready' && fileName ? (
        <p className="portal-form__hint">{t('uploadStatus.readyNamed', { name: fileName })}</p>
      ) : null}
      {errorKey ? (
        <p className="portal-form__error" role="alert">
          {t(`uploadErrors.${errorKey}`)}
        </p>
      ) : null}

      <input type="hidden" name={name} value={url} required={required} maxLength={maxLength} />

      <details className="portal-form__details">
        <summary className="portal-form__details-summary">{t('pasteUrlToggle')}</summary>
        <label className="portal-form__field" htmlFor={urlFallbackId}>
          <span className="portal-form__label">{t('fields.url')}</span>
          <input
            id={urlFallbackId}
            className="portal-form__input"
            type="text"
            value={url}
            maxLength={maxLength}
            onChange={(event) => {
              setUrl(event.target.value);
              setStatus(event.target.value ? 'ready' : 'idle');
              setErrorKey(null);
              setFileName(null);
            }}
            placeholder={t('fields.urlPlaceholder')}
          />
          <span className="portal-form__hint">{t('fields.urlHint')}</span>
        </label>
      </details>
    </div>
  );
}
