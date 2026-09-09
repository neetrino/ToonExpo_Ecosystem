'use client';

import type { MediaAssetItem } from '@toonexpo/contracts';
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { catalogMediaContext } from '@/features/builder/catalog-scope';
import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import { MediaUploadField } from '@/features/media/components/media-upload-field';
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
  const scope = useCatalogScope();
  const mediaContext = catalogMediaContext(scope);
  const [pickerMediaId, setPickerMediaId] = useState('');
  const [uploaderVersion, setUploaderVersion] = useState(0);

  const images = useMemo(() => splitLines(value), [value]);

  const appendImage = (asset: MediaAssetItem): void => {
    const src = asset.fileUrl.trim();
    if (!src) {
      return;
    }
    const existing = splitLines(value);
    if (existing.includes(src)) {
      setPickerMediaId('');
      setUploaderVersion((current) => current + 1);
      return;
    }
    onChange(joinLines([...existing, src]));
    setPickerMediaId('');
    setUploaderVersion((current) => current + 1);
  };

  const removeAt = (index: number): void => {
    const next = images.filter((_, itemIndex) => itemIndex !== index);
    onChange(joinLines(next));
  };

  return (
    <div className="space-y-4">
      <MediaUploadField
        key={`catalog-gallery-upload-${uploaderVersion}`}
        id="catalog-gallery-upload"
        label={t('galleryUploadLabel')}
        context={mediaContext}
        value={pickerMediaId}
        onChange={setPickerMediaId}
        onAssetSelected={appendImage}
        description={t('galleryUploadHint')}
        allowClear={false}
      />

      {images.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((src, index) => (
            <li key={`${src}-${index}`} className="group relative overflow-hidden rounded-sm border border-border bg-surface">
              <img src={src} alt={t('galleryImageAlt', { index: index + 1 })} className="h-24 w-full object-cover" />
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
