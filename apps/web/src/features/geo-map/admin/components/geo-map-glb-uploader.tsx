'use client';

import type { MediaAssetItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useId, useEffect, useRef, useState } from 'react';

import { GEO_MAP_GLB_MAX_BYTES } from '@/features/geo-map/admin/constants';
import { validateGlbFile } from '@/features/geo-map/admin/utils/validate-glb-file';
import { uploadMediaAsset } from '@/features/media/api/media-api';
import { ApiError } from '@/shared/api/errors';
import { cn } from '@/shared/ui/cn';

type GeoMapGlbUploaderProps = {
  onUploaded: (asset: MediaAssetItem) => void;
  disabled?: boolean | undefined;
  fileName?: string | null | undefined;
  /** Optional id for the browse label (admin map shortcuts). */
  browseButtonId?: string | undefined;
  /** Optional stable id for the hidden file input (programmatic file picker). */
  fileInputId?: string | undefined;
};

/**
 * Admin-only GLB uploader (`POST /admin/media?kind=model3d`) with client validation.
 */
export const GeoMapGlbUploader = ({
  onUploaded,
  disabled = false,
  fileName = null,
  browseButtonId,
  fileInputId,
}: GeoMapGlbUploaderProps) => {
  const t = useTranslations('Admin.geoMap.upload');
  const inputId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fileName) {
      return;
    }
    rootRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [fileName]);

  const handleFile = async (file: File): Promise<void> => {
    const code = validateGlbFile(file);
    if (code) {
      setError(t(`errors.${code}`));
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const asset = await uploadMediaAsset('admin', file, { kind: 'model3d' });
      onUploaded(asset);
    } catch (uploadError) {
      if (uploadError instanceof ApiError && uploadError.status === 503) {
        setError(t('errors.notConfigured'));
      } else {
        setError(t('errors.uploadFailed'));
      }
    } finally {
      setBusy(false);
    }
  };

  const maxMb = Math.round(GEO_MAP_GLB_MAX_BYTES / (1024 * 1024));

  return (
    <div ref={rootRef} className="flex flex-col gap-2">
      <span className="text-sm font-medium text-ink">{t('label')}</span>
      <div
        className={cn(
          'rounded-sm border border-dashed border-border px-3 py-3',
          (busy || disabled) && 'opacity-70',
        )}
      >
        <label
          id={browseButtonId}
          htmlFor={fileInputId ?? inputId}
          className={cn(
            'inline-flex cursor-pointer items-center rounded-sm border border-border px-3 py-2',
            'text-sm font-medium text-ink hover:bg-surface-muted',
            (busy || disabled) && 'pointer-events-none',
          )}
        >
          {busy ? t('uploading') : t('browse')}
        </label>
        <input
          id={fileInputId ?? inputId}
          type="file"
          accept=".glb,model/gltf-binary"
          className="sr-only"
          disabled={busy || disabled}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (file) {
              void handleFile(file);
            }
          }}
        />
        <p className="mt-2 text-xs text-ink-muted">{t('hint', { maxMb })}</p>
        {fileName ? (
          <p className="mt-1 truncate text-xs text-ink-secondary">
            {t('selected', { name: fileName })}
          </p>
        ) : null}
      </div>
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
};
