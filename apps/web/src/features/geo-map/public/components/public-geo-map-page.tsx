'use client';

import { useMemo, useState } from 'react';

import { GeoMapCanvasLazy } from '@/features/geo-map/components/geo-map-canvas-lazy';
import type { GeoMapObject } from '@/features/geo-map/types';
import { mapPublicGeoMapItemsToObjects } from '@/features/geo-map/utils/map-object-mapper';
import { GeoMapHoverCard } from '@/features/geo-map/public/components/geo-map-hover-card';
import { GeoMapStatusOverlays } from '@/features/geo-map/public/components/geo-map-status-overlays';
import { PUBLIC_GEO_MAP_MAP_HEIGHT_CLASS } from '@/features/geo-map/public/constants';
import { usePublicGeoMapModelsQuery } from '@/features/geo-map/public/hooks/use-public-geo-map-models';
import { buildProjectPublicHref } from '@/features/geo-map/public/utils/build-project-public-href';
import { resolvePublicGeoMapView } from '@/features/geo-map/public/utils/resolve-public-geo-map-view';
import { useRouter } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

const findObjectById = (objects: GeoMapObject[], id: string | null): GeoMapObject | null => {
  if (!id) {
    return null;
  }
  return objects.find((object) => object.id === id) ?? null;
};

/**
 * Visitor-facing 3D project map (read-only `GeoMapCanvas`).
 */
export const PublicGeoMapPage = () => {
  const router = useRouter();
  const modelsQuery = usePublicGeoMapModelsQuery();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const objects = useMemo(
    () => mapPublicGeoMapItemsToObjects(modelsQuery.data?.data ?? []),
    [modelsQuery.data?.data],
  );
  const view = useMemo(() => resolvePublicGeoMapView(objects), [objects]);
  const hoveredObject = findObjectById(objects, hoveredId);

  const onObjectClick = (id: string) => {
    const object = findObjectById(objects, id);
    if (!object) {
      return;
    }
    router.push(buildProjectPublicHref(object.projectId));
  };

  const showEmpty = !modelsQuery.isLoading && !modelsQuery.isError && objects.length === 0;

  return (
    <section className="relative w-full bg-map-canvas">
      <div className={cn('relative w-full', PUBLIC_GEO_MAP_MAP_HEIGHT_CLASS)}>
        <GeoMapCanvasLazy
          objects={objects}
          initialCenter={view.center}
          initialZoom={view.zoom}
          className="absolute inset-0 h-full w-full"
          onObjectHover={setHoveredId}
          onObjectClick={onObjectClick}
        />

        {hoveredObject ? <GeoMapHoverCard projectName={hoveredObject.label} /> : null}

        <GeoMapStatusOverlays
          isLoading={modelsQuery.isLoading}
          isError={modelsQuery.isError}
          isEmpty={showEmpty}
          onRetry={() => void modelsQuery.refetch()}
        />
      </div>
    </section>
  );
};
