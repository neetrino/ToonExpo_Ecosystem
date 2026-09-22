'use client';

import type { HomeHeroSlide } from '@toonexpo/contracts';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useTranslations } from 'next-intl';

import { AdminHomeBannerSlideRow } from '@/features/admin/components/admin-home-banner-slide-row';
import { Card } from '@/shared/ui/card';

type AdminHomeBannerSlideListProps = {
  slides: readonly HomeHeroSlide[];
  maxSlides: number;
  busy: boolean;
  onReorder: (slides: HomeHeroSlide[]) => void;
  onRemove: (mediaAssetId: string) => void;
};

/**
 * Ordered list of home hero banners — drag to reorder, icon to remove.
 */
export const AdminHomeBannerSlideList = ({
  slides,
  maxSlides,
  busy,
  onReorder,
  onRemove,
}: AdminHomeBannerSlideListProps) => {
  const t = useTranslations('Admin.homeBanner');
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const slideIds = slides.map((slide) => slide.mediaAssetId);

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const fromIndex = slides.findIndex((slide) => slide.mediaAssetId === active.id);
    const toIndex = slides.findIndex((slide) => slide.mediaAssetId === over.id);
    if (fromIndex < 0 || toIndex < 0) {
      return;
    }
    onReorder(arrayMove([...slides], fromIndex, toIndex));
  };

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-ink">{t('slidesTitle')}</h2>
        <p className="text-xs text-ink-muted">
          {t('slidesMeta', { count: slides.length, max: maxSlides })}
        </p>
      </div>

      {slides.length === 0 ? (
        <p className="px-4 py-6 text-sm text-ink-secondary">{t('slidesEmpty')}</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={slideIds} strategy={verticalListSortingStrategy}>
            <ul className="divide-y divide-border">
              {slides.map((slide, index) => (
                <AdminHomeBannerSlideRow
                  key={slide.mediaAssetId}
                  slide={slide}
                  index={index}
                  busy={busy}
                  onRemove={onRemove}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </Card>
  );
};
