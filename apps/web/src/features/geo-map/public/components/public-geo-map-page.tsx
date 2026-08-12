'use client';

import { useMemo } from 'react';

import { GeoMapCanvasLazy } from '@/features/geo-map/components/geo-map-canvas-lazy';
import type { GeoMapObject } from '@/features/geo-map/types';
import { mapPublicGeoMapItemsToObjects } from '@/features/geo-map/utils/map-object-mapper';
import { GeoMapStatusOverlays } from '@/features/geo-map/public/components/geo-map-status-overlays';
import { PUBLIC_GEO_MAP_CAMERA_CONTROLS_POSITION_CLASS, PUBLIC_GEO_MAP_MAP_HEIGHT_CLASS } from '@/features/geo-map/public/constants';
import { usePublicGeoMapModelsQuery } from '@/features/geo-map/public/hooks/use-public-geo-map-models';
import { buildProjectPublicHref } from '@/features/geo-map/public/utils/build-project-public-href';
import { resolvePublicGeoMapView } from '@/features/geo-map/public/utils/resolve-public-geo-map-view';
import { useRouter } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

const findObjectById = (objects: GeoMapObject[], id: string): GeoMapObject | null =>
  objects.find((object) => object.id === id) ?? null;

/**
 * Visitor-facing 3D project map (read-only `GeoMapCanvas`).
 * Info card (logo + name) is owned by the shared canvas on hover/select.
 */
export const PublicGeoMapPage = () => {
  const router = useRouter();
  const modelsQuery = usePublicGeoMapModelsQuery();

  const objects = useMemo(
    () => mapPublicGeoMapItemsToObjects(modelsQuery.data?.data ?? []),
    [modelsQuery.data?.data],
  );
  const view = useMemo(() => resolvePublicGeoMapView(objects), [objects]);

  const onObjectClick = (id: string) => {
    const object = findObjectById(objects, id);
    if (!object?.projectId) {
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
          cameraControlsClassName={PUBLIC_GEO_MAP_CAMERA_CONTROLS_POSITION_CLASS}
          onObjectClick={onObjectClick}
        />

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
