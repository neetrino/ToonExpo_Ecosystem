'use client';

import type { MediaAssetItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/ui/cn';

type MediaLibraryPanelProps = {
  items: MediaAssetItem[];
  selectedId: string;
  loading: boolean;
  canLoadMore: boolean;
  onSelect: (asset: MediaAssetItem) => void;
  onLoadMore: () => void;
};

/**
 * Thumbnail grid for picking an already-uploaded media asset.
 */
export const MediaLibraryPanel = ({
  items,
  selectedId,
  loading,
  canLoadMore,
  onSelect,
  onLoadMore,
}: MediaLibraryPanelProps) => {
  const t = useTranslations('Media.upload');

  if (items.length === 0 && !loading) {
    return <p className="text-sm text-ink-secondary">{t('emptyLibrary')}</p>;
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={cn(
              'aspect-square overflow-hidden rounded-sm border border-border',
              selectedId === item.id && 'ring-2 ring-brand',
            )}
            onClick={() => onSelect(item)}
          >
            <img src={item.fileUrl} alt={item.title ?? ''} className="size-full object-cover" />
          </button>
        ))}
      </div>
      {canLoadMore ? (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="mt-3"
          disabled={loading}
          onClick={onLoadMore}
        >
          {loading ? t('loadingLibrary') : t('loadMore')}
        </Button>
      ) : null}
    </div>
  );
};
