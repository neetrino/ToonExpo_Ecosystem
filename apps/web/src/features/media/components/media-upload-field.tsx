"use client";

import type { MediaAssetItem } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useId, useState } from "react";

import {
  listMediaAssets,
  uploadMediaAsset,
  type MediaUploadContext,
} from "@/features/media/api/media-api";
import {
  isAllowedMediaMimeType,
  MEDIA_UPLOAD_MAX_BYTES,
} from "@/features/media/constants";
import { ApiError } from "@/shared/api/errors";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/ui/cn";

export type MediaUploadFieldProps = {
  id: string;
  label: string;
  context: MediaUploadContext;
  value: string;
  onChange: (mediaAssetId: string) => void;
  previewUrl?: string | null | undefined;
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
  previewUrl,
  error,
}: MediaUploadFieldProps) => {
  const t = useTranslations("Media.upload");
  const inputId = useId();
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(
    previewUrl ?? null,
  );
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryItems, setLibraryItems] = useState<MediaAssetItem[]>([]);
  const [libraryPage, setLibraryPage] = useState(1);
  const [libraryTotalPages, setLibraryTotalPages] = useState(0);
  const [libraryLoading, setLibraryLoading] = useState(false);

  useEffect(() => {
    if (previewUrl) {
      setThumbnailUrl(previewUrl);
    }
  }, [previewUrl]);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!isAllowedMediaMimeType(file.type)) {
        return t("errors.type");
      }
      if (file.size > MEDIA_UPLOAD_MAX_BYTES) {
        return t("errors.size");
      }
      return null;
    },
    [t],
  );

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
    } catch (uploadError) {
      if (uploadError instanceof ApiError && uploadError.status === 503) {
        setLocalError(t("errors.notConfigured"));
      } else {
        setLocalError(t("errors.uploadFailed"));
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
      setLibraryItems((current) =>
        append ? [...current, ...response.data] : response.data,
      );
      setLibraryPage(response.meta.page);
      setLibraryTotalPages(response.meta.totalPages);
    } catch {
      setLocalError(t("errors.uploadFailed"));
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
      <span className="text-sm font-medium text-ink">{label}</span>
      <div
        className={cn(
          "rounded-sm border border-dashed border-border px-4 py-4",
          busy && "opacity-70",
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
            className="inline-flex cursor-pointer items-center rounded-sm border border-border px-3 py-2 text-sm font-medium text-ink hover:bg-surface-muted"
          >
            {busy ? t("uploading") : t("browse")}
          </label>
          <input
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="sr-only"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) {
                void handleUpload(file);
              }
            }}
          />
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() => {
              void openLibrary();
            }}
          >
            {t("useExisting")}
          </Button>
        </div>
        <p className="mt-2 text-xs text-ink-muted">{t("hint")}</p>
        {value ? (
          <p className="mt-1 text-xs text-ink-secondary">
            {t("selectedId", { id: value })}
          </p>
        ) : null}
      </div>
      {showLibrary ? (
        <LibraryPanel
          items={libraryItems}
          selectedId={value}
          loading={libraryLoading}
          canLoadMore={libraryPage < libraryTotalPages}
          onSelect={(asset) => {
            setThumbnailUrl(asset.fileUrl);
            onChange(asset.id);
            setShowLibrary(false);
          }}
          onLoadMore={() => {
            void loadLibrary(libraryPage + 1, true);
          }}
          onClose={() => setShowLibrary(false)}
        />
      ) : null}
      {displayError ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-danger">
          {displayError}
        </p>
      ) : null}
    </div>
  );
};

type LibraryPanelProps = {
  items: MediaAssetItem[];
  selectedId: string;
  loading: boolean;
  canLoadMore: boolean;
  onSelect: (asset: MediaAssetItem) => void;
  onLoadMore: () => void;
  onClose: () => void;
};

const LibraryPanel = ({
  items,
  selectedId,
  loading,
  canLoadMore,
  onSelect,
  onLoadMore,
  onClose,
}: LibraryPanelProps) => {
  const t = useTranslations("Media.upload");

  return (
    <div className="rounded-sm border border-border p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-ink">{t("libraryTitle")}</h3>
        <Button type="button" size="sm" variant="ghost" onClick={onClose}>
          {t("closeLibrary")}
        </Button>
      </div>
      {items.length === 0 && !loading ? (
        <p className="text-sm text-ink-secondary">{t("emptyLibrary")}</p>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={cn(
                "overflow-hidden rounded-sm border border-border",
                selectedId === item.id && "ring-2 ring-brand",
              )}
              onClick={() => onSelect(item)}
            >
              <img
                src={item.fileUrl}
                alt={item.title ?? ""}
                className="aspect-square h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
      {canLoadMore ? (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="mt-3"
          disabled={loading}
          onClick={onLoadMore}
        >
          {loading ? t("loadingLibrary") : t("loadMore")}
        </Button>
      ) : null}
    </div>
  );
};
