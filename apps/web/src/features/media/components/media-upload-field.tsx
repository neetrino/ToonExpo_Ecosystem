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
const MEDIA_ACTION_ROW_CLASS = 'flex min-w-0 flex-wrap items-stretch gap-2';
const MEDIA_ACTION_CONTROL_CLASS =
  'min-h-9 min-w-0 flex-1 basis-40 justify-center whitespace-normal text-center';

export type MediaUploadFieldProps = {
  id: string;
  label: string;
  context: MediaUploadContext;
  value: string;
  onChange: (mediaAssetId: string) => void;
  /** Fired with the full asset after upload or library pick (optional). */
  onAssetSelected?: ((asset: MediaAssetItem) => void) | undefined;
  /**
   * Fired once with all successfully uploaded assets when `multiple` is true.
   * Prefer this over per-file `onAssetSelected` for gallery-style append flows.
   */
  onAssetsSelected?: ((assets: MediaAssetItem[]) => void) | undefined;
  previewUrl?: string | null | undefined;
  /** Extra field-specific hint above the generic file-type help. */
  description?: string | undefined;
  /** When true (default), shows a control to clear the selected image. */
  allowClear?: boolean | undefined;
  /** When true, the file picker accepts multiple images in one selection. */
  multiple?: boolean | undefined;
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
  onAssetsSelected,
  previewUrl,
  description,
  allowClear = true,
  multiple = false,
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

  const handleUpload = async (file: File): Promise<MediaAssetItem | null> => {
    const validationError = validateFile(file);
    if (validationError) {
      setLocalError(validationError);
      return null;
    }

    try {
      return await uploadMediaAsset(context, file);
    } catch (uploadError) {
      if (uploadError instanceof ApiError && uploadError.status === 503) {
        setLocalError(t('errors.notConfigured'));
      } else {
        setLocalError(t('errors.uploadFailed'));
      }
      return null;
    }
  };

  const handleFilesSelected = async (files: FileList | null): Promise<void> => {
    if (files == null || files.length === 0) {
      return;
    }

    const selected = multiple ? Array.from(files) : [files[0]!];
    setBusy(true);
    setLocalError(null);

    try {
      const uploaded: MediaAssetItem[] = [];
      for (const file of selected) {
        const asset = await handleUpload(file);
        if (asset) {
          uploaded.push(asset);
        }
      }

      if (uploaded.length === 0) {
        return;
      }

      const last = uploaded[uploaded.length - 1]!;
      setThumbnailUrl(last.fileUrl);
      onChange(last.id);

      if (onAssetsSelected) {
        onAssetsSelected(uploaded);
      } else {
        for (const asset of uploaded) {
          onAssetSelected?.(asset);
        }
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
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex min-w-0 items-center justify-between gap-2">
        <span className="form-field-label min-w-0 text-sm font-medium text-ink">{label}</span>
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
          'min-w-0 overflow-hidden rounded-sm border border-dashed border-border px-4 py-4',
          busy && 'opacity-70',
        )}
      >
        <div className={MEDIA_ACTION_ROW_CLASS}>
          <label
            className={cn(
              'relative inline-flex cursor-pointer items-center overflow-hidden rounded-sm border border-border px-3 py-2 text-sm font-medium text-ink hover:bg-surface-muted',
              MEDIA_ACTION_CONTROL_CLASS,
            )}
          >
            {busy ? t('uploading') : thumbnailUrl ? t('replace') : t('browse')}
            <input
              id={inputId}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple={multiple}
              className="absolute inset-0 cursor-pointer opacity-0"
              disabled={busy}
              onChange={(event) => {
                const { files } = event.target;
                event.target.value = '';
                void handleFilesSelected(files);
              }}
            />
          </label>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className={cn('h-auto', MEDIA_ACTION_CONTROL_CLASS)}
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
