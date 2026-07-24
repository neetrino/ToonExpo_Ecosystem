'use client';

import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';

import { catalogMediaContext } from '@/features/builder/catalog-scope';
import { uploadMediaAsset } from '@/features/media/api/media-api';
import { isAllowedMediaMimeType, MEDIA_UPLOAD_MAX_BYTES } from '@/features/media/constants';
import { ApiError } from '@/shared/api/errors';
import { cn } from '@/shared/ui/cn';

type FloorPlanUploadTileProps = {
  label: string;
  mediaId: string;
  previewUrl: string | null;
  companyId: string;
  disabled: boolean;
  onUploaded: (mediaId: string, previewUrl: string) => void;
};

/**
 * Compact dashed upload card for one floor plan.
 */
export const FloorPlanUploadTile = ({
  label,
  mediaId,
  previewUrl,
  companyId,
  disabled,
  onUploaded,
}: FloorPlanUploadTileProps) => {
  const t = useTranslations('Admin.buildings.inventory.floorPlans');
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const mediaContext = catalogMediaContext({ mode: 'admin', companyId });

  return (
    <div className="flex flex-col gap-2 rounded-lg bg-surface p-3">
      <p className="text-sm font-medium text-ink">{label}</p>
      <label
        htmlFor={inputId}
        className={cn(
          'flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2',
          'rounded-md border border-dashed border-border px-3 py-4 text-center',
          'transition-colors hover:bg-brand-soft/30',
          (disabled || uploading) && 'pointer-events-none opacity-70',
        )}
      >
        {previewUrl || mediaId ? (
          previewUrl ? (
            <img src={previewUrl} alt="" className="max-h-24 w-auto rounded-sm object-contain" />
          ) : (
            <span className="text-xs text-ink-secondary">{t('planSelected')}</span>
          )
        ) : (
          <span className="text-sm text-ink-muted">{t('uploadPlan')}</span>
        )}
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="sr-only"
          disabled={disabled || uploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (!file) {
              return;
            }
            if (!isAllowedMediaMimeType(file.type)) {
              setLocalError(t('uploadTypeError'));
              return;
            }
            if (file.size > MEDIA_UPLOAD_MAX_BYTES) {
              setLocalError(t('uploadSizeError'));
              return;
            }
            setLocalError(null);
            setUploading(true);
            void uploadMediaAsset(mediaContext, file)
              .then((asset) => {
                onUploaded(asset.id, asset.fileUrl);
              })
              .catch((uploadError: unknown) => {
                if (uploadError instanceof ApiError && uploadError.status === 503) {
                  setLocalError(t('uploadNotConfigured'));
                } else {
                  setLocalError(t('uploadFailed'));
                }
              })
              .finally(() => {
                setUploading(false);
              });
          }}
        />
      </label>
      {uploading ? <p className="text-xs text-ink-muted">{t('uploading')}</p> : null}
      {localError ? (
        <p role="alert" className="text-xs text-danger">
          {localError}
        </p>
      ) : null}
    </div>
  );
};
