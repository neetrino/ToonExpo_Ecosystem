'use client';

import type { HomeHeroSlide } from '@toonexpo/contracts';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { IconButton } from '@/shared/ui/icon-button';
import { cn } from '@/shared/ui/cn';

const GRIP_ICON_CLASS = 'size-4';
const DELETE_ICON_CLASS = 'size-4';

type AdminHomeBannerSlideRowProps = {
  slide: HomeHeroSlide;
  index: number;
  busy: boolean;
  onRemove: (mediaAssetId: string) => void;
};

/**
 * One sortable banner row — grip handle, thumbnail, label, delete icon.
 */
export const AdminHomeBannerSlideRow = ({
  slide,
  index,
  busy,
  onRemove,
}: AdminHomeBannerSlideRowProps) => {
  const t = useTranslations('Admin.homeBanner');
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: slide.mediaAssetId,
    disabled: busy,
  });

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        'flex items-center gap-3 px-3 py-3',
        isDragging && 'z-10 bg-surface-elevated opacity-70 shadow-md',
      )}
    >
      <button
        type="button"
        className={cn(
          'touch-none shrink-0 text-ink-muted',
          busy ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing hover:text-ink',
        )}
        aria-label={t('dragHandle')}
        disabled={busy}
        {...attributes}
        {...listeners}
      >
        <GripVertical className={GRIP_ICON_CLASS} strokeWidth={1.75} aria-hidden />
      </button>
      <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-canvas">
        <Image src={slide.imageUrl} alt="" fill className="object-cover" sizes="44px" />
      </div>
      <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
        {t('slideLabel', { index: index + 1 })}
      </p>
      <IconButton
        label={t('remove')}
        size="sm"
        className="shrink-0 text-ink-muted hover:bg-danger-soft hover:text-danger"
        disabled={busy}
        onClick={() => onRemove(slide.mediaAssetId)}
      >
        <Trash2 className={DELETE_ICON_CLASS} strokeWidth={1.75} aria-hidden />
      </IconButton>
    </li>
  );
};
