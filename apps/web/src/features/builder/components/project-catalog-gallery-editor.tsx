'use client';

import type { MediaAssetItem } from '@toonexpo/contracts';
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId, useMemo, useRef, useState } from 'react';

import { catalogMediaContext } from '@/features/builder/catalog-scope';
import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import { listMediaAssets, uploadMediaAsset } from '@/features/media/api/media-api';
import { isAllowedMediaMimeType, MEDIA_UPLOAD_MAX_BYTES } from '@/features/media/constants';
import { ApiError } from '@/shared/api/errors';
import { Button } from '@/shared/ui/button';
import { IconButton } from '@/shared/ui/icon-button';

type ProjectCatalogGalleryEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

const splitLines = (value: string): string[] =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

const joinLines = (items: readonly string[]): string => items.join('\n');

/** Project-level gallery uploader storing canonical file URLs in `amenities.gallery`. */
export const ProjectCatalogGalleryEditor = ({
  value,
  onChange,
}: ProjectCatalogGalleryEditorProps) => {
  const t = useTranslations('Builder.projects.catalog');
  const tMedia = useTranslations('Media.upload');
  const scope = useCatalogScope();
  const mediaContext = catalogMediaContext(scope);
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryItems, setLibraryItems] = useState<MediaAssetItem[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);

  const images = useMemo(() => splitLines(value), [value]);

  const appendUrls = (urls: readonly string[]): void => {
    const existing = splitLines(value);
    const next = [...existing];
    for (const url of urls) {
      const src = url.trim();
      if (src && !next.includes(src)) {
        next.push(src);
      }
    }
    if (next.length !== existing.length) {
      onChange(joinLines(next));
    }
  };

  const removeAt = (index: number): void => {
    const next = images.filter((_, itemIndex) => itemIndex !== index);
    onChange(joinLines(next));
  };

  const openLibrary = async (): Promise<void> => {
    setShowLibrary(true);
    setLibraryLoading(true);
    setError(null);
    try {
      const page = await listMediaAssets(mediaContext, 1, 24);
      setLibraryItems(page.data);
    } catch {
      setError(tMedia('errors.uploadFailed'));
    } finally {
      setLibraryLoading(false);
    }
  };

  const onFilesSelected = async (files: FileList | null): Promise<void> => {
    if (files == null || files.length === 0) {
      return;
    }

    setBusy(true);
    setError(null);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        if (!isAllowedMediaMimeType(file.type)) {
          setError(tMedia('errors.type'));
          continue;
        }
        if (file.size > MEDIA_UPLOAD_MAX_BYTES) {
          setError(tMedia('errors.size'));
          continue;
        }

        try {
          const asset = await uploadMediaAsset(mediaContext, file);
          const src = asset.fileUrl.trim();
          if (src) {
            uploadedUrls.push(src);
          }
        } catch (uploadError) {
          if (uploadError instanceof ApiError && uploadError.status === 503) {
            setError(tMedia('errors.notConfigured'));
            break;
          }
          setError(tMedia('errors.uploadFailed'));
        }
      }

      if (uploadedUrls.length > 0) {
        appendUrls(uploadedUrls);
      }
    } finally {
      setBusy(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <span className="form-field-label text-sm font-medium text-ink">
          {t('galleryUploadLabel')}
        </span>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileInputRef}
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            className="sr-only"
            disabled={busy}
            onChange={(event) => {
              void onFilesSelected(event.target.files);
            }}
          />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={() => fileInputRef.current?.click()}
          >
            {busy ? tMedia('uploading') : tMedia('browse')}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() => {
              void openLibrary();
            }}
          >
            {tMedia('useExisting')}
          </Button>
        </div>
        <p className="text-xs text-ink-muted">{t('galleryUploadHint')}</p>
        <p className="text-xs text-ink-muted">{tMedia('hint')}</p>
      </div>

      {showLibrary ? (
        <div className="rounded-md border border-border p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-ink">{tMedia('libraryTitle')}</p>
            <button
              type="button"
              className="text-xs text-ink-secondary hover:underline"
              onClick={() => setShowLibrary(false)}
            >
              {tMedia('closeLibrary')}
            </button>
          </div>
          {libraryLoading ? (
            <p className="text-sm text-ink-secondary">{tMedia('loadingLibrary')}</p>
          ) : (
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {libraryItems.map((asset) => (
                <li key={asset.id}>
                  <button
                    type="button"
                    className="aspect-square w-full overflow-hidden rounded-sm ring-1 ring-header-border"
                    onClick={() => {
                      appendUrls([asset.fileUrl]);
                      setShowLibrary(false);
                    }}
                  >
                    <img
                      src={asset.thumbnailUrl ?? asset.fileUrl}
                      alt=""
                      className="size-full object-cover"
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}

      {images.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((src, index) => (
            <li
              key={`${src}-${index}`}
              className="group relative overflow-hidden rounded-sm border border-border bg-surface"
            >
              <img
                src={src}
                alt={t('galleryImageAlt', { index: index + 1 })}
                className="h-24 w-full object-cover"
              />
              <IconButton
                type="button"
                size="sm"
                variant="ghost"
                label={t('galleryRemove')}
                className="absolute top-1 right-1 bg-surface/90 text-danger opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => {
                  removeAt(index);
                }}
              >
                <Trash2 className="size-4" aria-hidden />
              </IconButton>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};
