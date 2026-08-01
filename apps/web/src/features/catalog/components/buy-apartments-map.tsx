'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { GeoMapCanvasLazy } from '@/features/geo-map/components/geo-map-canvas-lazy';
import type { GeoMapFocusRequest, GeoMapObject } from '@/features/geo-map/types';
import { mapPublicGeoMapItemsToObjects } from '@/features/geo-map/utils/map-object-mapper';
import { GeoMapStatusOverlays } from '@/features/geo-map/public/components/geo-map-status-overlays';
import { usePublicGeoMapModelsQuery } from '@/features/geo-map/public/hooks/use-public-geo-map-models';
import { resolvePublicGeoMapView } from '@/features/geo-map/public/utils/resolve-public-geo-map-view';
import { cn } from '@/shared/ui/cn';

type BuyApartmentsMapProps = {
  focusRequest?: GeoMapFocusRequest | undefined;
  highlightedObjectId?: string | null | undefined;
  homesInViewCount: number;
  /** Map → list: select a project model without navigating away. */
  onObjectSelect?: ((object: GeoMapObject) => void) | undefined;
  className?: string | undefined;
};

const findObjectById = (objects: GeoMapObject[], id: string): GeoMapObject | null =>
  objects.find((object) => object.id === id) ?? null;

/**
 * Buy-page map panel — published 3D project models with bidirectional list sync.
 */
export const BuyApartmentsMap = ({
  focusRequest,
  highlightedObjectId = null,
  homesInViewCount,
  onObjectSelect,
  className,
}: BuyApartmentsMapProps) => {
  const t = useTranslations('BuyPage');
  const modelsQuery = usePublicGeoMapModelsQuery();

  const objects = useMemo(
    () => mapPublicGeoMapItemsToObjects(modelsQuery.data?.data ?? []),
    [modelsQuery.data?.data],
  );
  const view = useMemo(() => resolvePublicGeoMapView(objects), [objects]);
  const showEmpty = !modelsQuery.isLoading && !modelsQuery.isError && objects.length === 0;

  const onObjectClick = (id: string): void => {
    const object = findObjectById(objects, id);
    if (!object || onObjectSelect == null) {
      return;
    }
    onObjectSelect(object);
  };

  return (
    <div
      className={cn(
        'relative h-[min(70vh,52rem)] overflow-hidden bg-map-canvas lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)]',
        className,
      )}
    >
      <GeoMapCanvasLazy
        objects={objects}
        initialCenter={view.center}
        initialZoom={view.zoom}
        focusRequest={focusRequest}
        highlightedObjectId={highlightedObjectId}
        className="absolute inset-0 h-full w-full"
        onObjectClick={onObjectClick}
      />

      <GeoMapStatusOverlays
        isLoading={modelsQuery.isLoading}
        isError={modelsQuery.isError}
        isEmpty={showEmpty}
        onRetry={() => void modelsQuery.refetch()}
      />

      <div className="pointer-events-none absolute bottom-4 left-4 z-[1] inline-flex items-center gap-2 rounded-xl bg-canvas/95 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-ink-navy shadow-md ring-1 ring-header-border">
        <span className="size-2 shrink-0 rounded-pill bg-brand-secondary" aria-hidden />
        {t('homesInView', { count: homesInViewCount })}
      </div>
    </div>
  );
};
