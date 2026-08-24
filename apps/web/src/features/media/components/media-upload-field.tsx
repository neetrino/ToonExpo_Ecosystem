'use client';

import type { MediaAssetItem } from '@toonexpo/contracts';
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

import {
  listMediaAssets,
  uploadMediaAsset,
  type MediaUploadContext,
} from '@/features/media/api/media-api';
import { MediaLibraryPanel } from '@/features/media/components/media-library-panel';
import { isAllowedMediaMimeType, MEDIA_UPLOAD_MAX_BYTES } from '@/features/media/constants';
import { useMediaFieldPreview } from '@/features/media/hooks/use-media-field-preview';
import { ApiError } from '@/shared/api/errors';
import { AdminDeleteModal } from '@/shared/ui/admin-delete-modal';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/ui/cn';
import { Dialog } from '@/shared/ui/dialog';
import { IconButton } from '@/shared/ui/icon-button';

/**
 * Out-of-flow preview: tall uploads must not contribute intrinsic height to
 * the parent sheet scroll (CSS zoom + flex min-height:auto leak).
 */
const MEDIA_PREVIEW_FRAME_CLASS =
  'relative mt-3 block h-40 w-full cursor-pointer overflow-hidden rounded-sm border border-border bg-surface [contain:strict]';
const MEDIA_PREVIEW_IMAGE_CLASS = 'absolute inset-0 size-full object-contain';

export type MediaUploadFieldProps = {
  id: string;
  label: string;
  context: MediaUploadContext;
  value: string;
  onChange: (mediaAssetId: string) => void;
  /** Fired with the full asset after upload or library pick (optional). */
  onAssetSelected?: ((asset: MediaAssetItem) => void) | undefined;
  previewUrl?: string | null | undefined;
  /** Extra field-specific hint above the generic file-type help. */
  description?: string | undefined;
  /** When true (default), shows a control to clear the selected image. */
  allowClear?: boolean | undefined;
  error?: string | undefined;
};

/**
 * Image upload + existing-media picker for portal and admin forms.
 */
export const MediaUploadField = ({
  id,
  label,
  context,
  value,
  onChange,
  onAssetSelected,
  previewUrl,
  description,
  allowClear = true,
  error,
}: MediaUploadFieldProps) => {
  const t = useTranslations('Media.upload');
  const tCommon = useTranslations('Common');
  const inputId = `${id}-file`;
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useMediaFieldPreview(context, value, previewUrl);
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryItems, setLibraryItems] = useState<MediaAssetItem[]>([]);
  const [libraryPage, setLibraryPage] = useState(1);
  const [libraryTotalPages, setLibraryTotalPages] = useState(0);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const hasSelection = value.trim().length > 0 || Boolean(thumbnailUrl);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!isAllowedMediaMimeType(file.type)) {
        return t('errors.type');
      }
      if (file.size > MEDIA_UPLOAD_MAX_BYTES) {
        return t('errors.size');
      }
      return null;
    },
    [t],
  );

  const clearSelection = () => {
    setThumbnailUrl(null);
    setLocalError(null);
    setConfirmClearOpen(false);
    onChange('');
  };

  const handleUpload = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    setBusy(true);
    setLocalError(null);

    try {
      const asset = await uploadMediaAsset(context, file);
      setThumbnailUrl(asset.fileUrl);
      onChange(asset.id);
      onAssetSelected?.(asset);
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

  const loadLibrary = async (page: number, append: boolean) => {
    setLibraryLoading(true);
    setLocalError(null);

    try {
      const response = await listMediaAssets(context, page);
      setLibraryItems((current) => (append ? [...current, ...response.data] : response.data));
      setLibraryPage(response.meta.page);
      setLibraryTotalPages(response.meta.totalPages);
    } catch {
      setLocalError(t('errors.uploadFailed'));
    } finally {
      setLibraryLoading(false);
    }
  };

  const openLibrary = async () => {
    setShowLibrary(true);
    await loadLibrary(1, false);
  };

  const displayError = error ?? localError ?? undefined;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <span className="form-field-label text-sm font-medium text-ink">{label}</span>
        {allowClear && hasSelection ? (
          <IconButton
            type="button"
            size="sm"
            variant="ghost"
            label={t('clear')}
            disabled={busy}
            className="shrink-0 text-danger hover:bg-danger/10 hover:text-danger"
            onClick={() => {
              setConfirmClearOpen(true);
            }}
          >
            <Trash2 className="size-4" aria-hidden />
          </IconButton>
        ) : null}
      </div>
      <div
        className={cn(
          'rounded-sm border border-dashed border-border px-4 py-4',
          busy && 'opacity-70',
        )}
      >
        <div className="flex flex-nowrap items-center gap-2">
          <label
            className="relative inline-flex shrink-0 cursor-pointer items-center overflow-hidden rounded-sm border border-border px-3 py-2 text-sm font-medium whitespace-nowrap text-ink hover:bg-surface-muted"
          >
            {busy ? t('uploading') : thumbnailUrl ? t('replace') : t('browse')}
            <input
              id={inputId}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="absolute inset-0 cursor-pointer opacity-0"
              disabled={busy}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = '';
                if (file) {
                  void handleUpload(file);
                }
              }}
            />
          </label>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="shrink-0 whitespace-nowrap"
            disabled={busy}
            onClick={() => {
              void openLibrary();
            }}
          >
            {t('useExisting')}
          </Button>
        </div>
        {thumbnailUrl ? (
          <label htmlFor={inputId} className={MEDIA_PREVIEW_FRAME_CLASS}>
            <img src={thumbnailUrl} alt="" className={MEDIA_PREVIEW_IMAGE_CLASS} />
            <span className="sr-only">{t('replace')}</span>
          </label>
        ) : null}
        {description ? <p className="mt-2 text-xs text-ink-muted">{description}</p> : null}
        <p className="mt-2 text-xs text-ink-muted">{t('hint')}</p>
      </div>
      {displayError ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-danger">
          {displayError}
        </p>
      ) : null}

      <Dialog
        open={showLibrary}
        onClose={() => setShowLibrary(false)}
        title={t('libraryTitle')}
        className="max-w-lg"
      >
        <MediaLibraryPanel
          items={libraryItems}
          selectedId={value}
          loading={libraryLoading}
          canLoadMore={libraryPage < libraryTotalPages}
          onSelect={(asset) => {
            setThumbnailUrl(asset.fileUrl);
            onChange(asset.id);
            onAssetSelected?.(asset);
            setShowLibrary(false);
          }}
          onLoadMore={() => {
            void loadLibrary(libraryPage + 1, true);
          }}
        />
      </Dialog>

      <AdminDeleteModal
        open={confirmClearOpen}
        title={t('removeConfirmTitle')}
        message={t('removeConfirmMessage')}
        confirmLabel={t('remove')}
        cancelLabel={tCommon('cancel')}
        onCancel={() => {
          setConfirmClearOpen(false);
        }}
        onConfirm={clearSelection}
      />
    </div>
  );
};
