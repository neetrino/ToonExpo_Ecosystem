'use client';

import type { MediaAssetItem, MediaAssetSummary, PortalApartmentDetail } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState } from 'react';

import { ApartmentGalleryThumbGrid } from '@/features/builder/components/apartment-gallery-thumb-grid';
import { catalogMediaContext } from '@/features/builder/catalog-scope';
import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import { useUpdateApartmentMutation } from '@/features/builder/hooks/use-portal-inventory';
import { listMediaAssets, uploadMediaAsset } from '@/features/media/api/media-api';
import { isAllowedMediaMimeType, MEDIA_UPLOAD_MAX_BYTES } from '@/features/media/constants';
import { Button } from '@/shared/ui/button';
import { ConfirmDeleteModal } from '@/shared/ui/confirm-delete-modal';
import { useSuccessToast } from '@/shared/ui/use-success-toast';

const GALLERY_MAX = 12;

type GalleryItem = { id: string; fileUrl: string };

type EditApartmentGalleryFormProps = {
  apartment: PortalApartmentDetail;
};

const toGalleryItems = (apartment: PortalApartmentDetail): GalleryItem[] => {
  const gallery = apartment.gallery ?? [];
  if (gallery.length > 0) {
    return gallery.map((item) => ({ id: item.id, fileUrl: item.fileUrl }));
  }
  if (apartment.cover) {
    return [{ id: apartment.cover.id, fileUrl: apartment.cover.fileUrl }];
  }
  return [];
};

/**
 * Multi-image apartment gallery with one selectable main (cover) photo.
 */
export const EditApartmentGalleryForm = ({ apartment }: EditApartmentGalleryFormProps) => {
  const scope = useCatalogScope();
  const mediaContext = catalogMediaContext(scope);
  const t = useTranslations('Builder.apartments');
  const tMedia = useTranslations('Media.upload');
  const mutation = useUpdateApartmentMutation(apartment.id);
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, successToast } = useSuccessToast();

  const [items, setItems] = useState<GalleryItem[]>(() => toGalleryItems(apartment));
  const [mainId, setMainId] = useState<string | null>(apartment.coverMediaId);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryItems, setLibraryItems] = useState<MediaAssetItem[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

  useEffect(() => {
    setItems(toGalleryItems(apartment));
    setMainId(apartment.coverMediaId);
  }, [apartment]);

  const initialIds = toGalleryItems(apartment)
    .map((item) => item.id)
    .join(',');
  const isDirty =
    items.map((item) => item.id).join(',') !== initialIds ||
    (mainId ?? '') !== (apartment.coverMediaId ?? '');
  const mainPreview =
    items.find((item) => item.id === mainId)?.fileUrl ?? items[0]?.fileUrl ?? null;

  const addAsset = (asset: Pick<MediaAssetSummary, 'id' | 'fileUrl'> | MediaAssetItem): void => {
    setItems((current) => {
      if (current.some((item) => item.id === asset.id) || current.length >= GALLERY_MAX) {
        return current;
      }
      if (current.length === 0) {
        setMainId(asset.id);
      }
      return [...current, { id: asset.id, fileUrl: asset.fileUrl }];
    });
  };

  const removeItem = (id: string): void => {
    setItems((current) => {
      const next = current.filter((item) => item.id !== id);
      if (mainId === id) {
        setMainId(next[0]?.id ?? null);
      }
      return next;
    });
  };

  const openLibrary = async (): Promise<void> => {
    setShowLibrary(true);
    setLibraryLoading(true);
    setError(null);
    try {
      const page = await listMediaAssets(mediaContext, 1, 24);
      setLibraryItems(page.data);
    } catch {
      setError(t('errors.generic'));
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
    try {
      for (const file of Array.from(files)) {
        if (items.length >= GALLERY_MAX) {
          break;
        }
        if (!isAllowedMediaMimeType(file.type)) {
          setError(tMedia('errors.type'));
          continue;
        }
        if (file.size > MEDIA_UPLOAD_MAX_BYTES) {
          setError(tMedia('errors.size'));
          continue;
        }
        addAsset(await uploadMediaAsset(mediaContext, file));
      }
    } catch {
      setError(t('errors.generic'));
    } finally {
      setBusy(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const onSave = async (): Promise<void> => {
    setBusy(true);
    setError(null);
    try {
      const updated = await mutation.mutateAsync({
        galleryMediaIds: items.map((item) => item.id),
        coverMediaId: mainId,
      });
      setItems(toGalleryItems(updated));
      setMainId(updated.coverMediaId);
      showSuccess(t('coverSaved'));
    } catch {
      setError(t('errors.generic'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileInputRef}
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            className="sr-only"
            onChange={(event) => {
              void onFilesSelected(event.target.files);
            }}
          />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={busy || items.length >= GALLERY_MAX}
            onClick={() => fileInputRef.current?.click()}
          >
            {t('galleryUpload')}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={busy || items.length >= GALLERY_MAX}
            onClick={() => {
              void openLibrary();
            }}
          >
            {tMedia('useExisting')}
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(12rem,16rem)] lg:items-start">
          <ApartmentGalleryThumbGrid
            items={items}
            mainId={mainId}
            mainLabel={t('galleryMain')}
            setMainLabel={t('gallerySetMain')}
            removeLabel={tMedia('remove')}
            onSelectMain={setMainId}
            onRemove={setPendingRemoveId}
          />
          <div className="overflow-hidden rounded-md bg-surface ring-1 ring-header-border">
            {mainPreview ? (
              <img
                src={mainPreview}
                alt={t('galleryMainPreview')}
                className="aspect-[4/3] w-full object-cover"
              />
            ) : (
              <p className="grid aspect-[4/3] place-items-center px-3 text-center text-sm text-ink-secondary">
                {t('galleryEmpty')}
              </p>
            )}
          </div>
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
                        addAsset(asset);
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

        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={busy || mutation.isPending || !isDirty}
          onClick={() => {
            void onSave();
          }}
        >
          {busy || mutation.isPending ? t('saving') : t('saveCover')}
        </Button>
      </div>
      {successToast}
      <ConfirmDeleteModal
        open={pendingRemoveId != null}
        title={tMedia('removeConfirmTitle')}
        message={tMedia('removeConfirmMessage')}
        confirmLabel={tMedia('remove')}
        onCancel={() => setPendingRemoveId(null)}
        onConfirm={() => {
          if (pendingRemoveId) {
            removeItem(pendingRemoveId);
          }
          setPendingRemoveId(null);
        }}
      />
    </>
  );
};
