'use client';

import type { MediaAssetItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';

import {
  listMediaAssets,
  uploadMediaAsset,
  type MediaUploadContext,
} from '@/features/media/api/media-api';
import { isAllowedMediaMimeType, MEDIA_UPLOAD_MAX_BYTES } from '@/features/media/constants';
import { ApiError } from '@/shared/api/errors';
import { AdminDeleteModal } from '@/shared/ui/admin-delete-modal';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/ui/cn';

import { prepareImageForUpload } from '../../utils/prepare-image-upload';

export type MappingImageUploaderProps = {
  id: string;
  label: string;
  context: MediaUploadContext;
  value: string;
  onChange: (asset: MediaAssetItem) => void;
  /** Clears the attached mapping image (parent persists removal). */
  onClear?: (() => void | Promise<void>) | undefined;
  previewUrl?: string | null | undefined;
  error?: string | undefined;
};

/**
 * Compresses images client-side, then uploads via admin/company media → R2.
 */
export const MappingImageUploader = ({
  id,
  label,
  context,
  value,
  onChange,
  onClear,
  previewUrl,
  error,
}: MappingImageUploaderProps) => {
  const t = useTranslations('Media.upload');
  const tCommon = useTranslations('Common');
  const inputId = useId();
  const [busy, setBusy] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(previewUrl ?? null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryItems, setLibraryItems] = useState<MediaAssetItem[]>([]);
  const hasSelection = Boolean(value || thumbnailUrl);
  const interactionLocked = busy || clearing;

  const handlePreparedUpload = async (file: File) => {
    if (!isAllowedMediaMimeType(file.type)) {
      setLocalError(t('errors.type'));
      return;
    }
    if (file.size > MEDIA_UPLOAD_MAX_BYTES * 4) {
      setLocalError(t('errors.size'));
      return;
    }
    setBusy(true);
    setLocalError(null);
    try {
      const prepared = await prepareImageForUpload(file);
      const asset = await uploadMediaAsset(context, prepared.file);
      setThumbnailUrl(asset.fileUrl);
      onChange(asset);
    } catch (uploadError) {
      if (uploadError instanceof ApiError && uploadError.status === 503) {
        setLocalError(t('errors.notConfigured'));
      } else {
        setLocalError(t('errors.uploadFailed'));
      }
    } finally {
      setBusy(false);
    }
  };

  const openLibrary = async () => {
    setShowLibrary(true);
    setLocalError(null);
    try {
      const response = await listMediaAssets(context, 1);
      setLibraryItems(response.data);
    } catch {
      setLocalError(t('errors.uploadFailed'));
    }
  };

  const handleConfirmedClear = async () => {
    if (!onClear) {
      return;
    }
    setClearing(true);
    setLocalError(null);
    try {
      await onClear();
      setThumbnailUrl(null);
      setShowLibrary(false);
      setConfirmOpen(false);
    } catch {
      // Parent surfaces the failure; keep the current preview and close the modal.
      setConfirmOpen(false);
    } finally {
      setClearing(false);
    }
  };

  const displayError = error ?? localError ?? undefined;

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium text-ink">{label}</span>
      <div
        className={cn(
          'rounded-sm border border-dashed border-border bg-background px-4 py-4',
          interactionLocked && 'opacity-70',
        )}
      >
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt=""
            className="mb-3 max-h-40 w-auto rounded-sm border border-border object-contain"
          />
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <label
            htmlFor={inputId}
            className={cn(
              'inline-flex cursor-pointer items-center rounded-[15px] border border-border px-3 py-2 text-sm font-medium text-ink hover:bg-surface',
              interactionLocked && 'pointer-events-none opacity-50',
            )}
          >
            {busy ? t('uploading') : t('browse')}
          </label>
          <input
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
            className="sr-only"
            disabled={interactionLocked}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (file) {
                void handlePreparedUpload(file);
              }
            }}
          />
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={interactionLocked}
            onClick={() => {
              void openLibrary();
            }}
          >
            {t('useExisting')}
          </Button>
          {hasSelection && onClear ? (
            <Button
              type="button"
              size="sm"
              variant="danger"
              disabled={interactionLocked}
              onClick={() => {
                setConfirmOpen(true);
              }}
            >
              {t('remove')}
            </Button>
          ) : null}
        </div>
        <p className="mt-2 text-xs text-ink-muted">{t('hint')}</p>
        {value ? (
          <p className="mt-1 text-xs text-ink-secondary">{t('selectedId', { id: value })}</p>
        ) : null}
      </div>

      {showLibrary ? (
        <div className="rounded-sm border border-border bg-background p-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-ink">{t('libraryTitle')}</h3>
            <Button type="button" size="sm" variant="ghost" onClick={() => setShowLibrary(false)}>
              {t('closeLibrary')}
            </Button>
          </div>
          {libraryItems.length === 0 ? (
            <p className="text-sm text-ink-muted">{t('emptyLibrary')}</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {libraryItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={cn(
                    'overflow-hidden rounded-[15px] border border-border',
                    value === item.id && 'border-ink',
                  )}
                  onClick={() => {
                    setThumbnailUrl(item.fileUrl);
                    onChange(item);
                    setShowLibrary(false);
                  }}
                >
                  <img
                    src={item.thumbnailUrl ?? item.fileUrl}
                    alt={item.title ?? ''}
                    className="aspect-square h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {displayError ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-danger">
          {displayError}
        </p>
      ) : null}

      {onClear ? (
        <AdminDeleteModal
          open={confirmOpen}
          title={t('removeConfirmTitle')}
          message={t('mappingRemoveConfirmMessage')}
          confirmLabel={t('remove')}
          cancelLabel={tCommon('cancel')}
          confirming={clearing}
          onCancel={() => {
            if (!clearing) {
              setConfirmOpen(false);
            }
          }}
          onConfirm={() => {
            void handleConfirmedClear();
          }}
        />
      ) : null}
    </div>
  );
};
