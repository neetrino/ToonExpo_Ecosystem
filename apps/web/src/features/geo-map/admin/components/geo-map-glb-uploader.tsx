'use client';

import type { MediaAssetItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';

import { GEO_MAP_GLB_MAX_BYTES } from '@/features/geo-map/admin/constants';
import { validateGlbFile } from '@/features/geo-map/admin/utils/validate-glb-file';
import { uploadMediaAsset } from '@/features/media/api/media-api';
import { ApiError } from '@/shared/api/errors';
import { cn } from '@/shared/ui/cn';

type GeoMapGlbUploaderProps = {
  onUploaded: (asset: MediaAssetItem) => void;
  disabled?: boolean | undefined;
  fileName?: string | null | undefined;
};

/**
 * Admin-only GLB uploader (`POST /admin/media?kind=model3d`) with client validation.
 */
export const GeoMapGlbUploader = ({
  onUploaded,
  disabled = false,
  fileName = null,
}: GeoMapGlbUploaderProps) => {
  const t = useTranslations('Admin.geoMap.upload');
  const inputId = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-ink">{t('label')}</span>
      <div
        className={cn(
          'rounded-sm border border-dashed border-border px-3 py-3',
          (busy || disabled) && 'opacity-70',
        )}
      >
        <label
          htmlFor={inputId}
          className={cn(
            'inline-flex cursor-pointer items-center rounded-sm border border-border px-3 py-2',
            'text-sm font-medium text-ink hover:bg-surface-muted',
            (busy || disabled) && 'pointer-events-none',
          )}
        >
          {busy ? t('uploading') : t('browse')}
        </label>
        <input
          id={inputId}
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
