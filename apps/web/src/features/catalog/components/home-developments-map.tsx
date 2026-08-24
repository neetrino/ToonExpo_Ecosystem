'use client';

import { useMemo, useState } from 'react';

import { HOME_GEO_MAP_HEIGHT_CLASS } from '@/features/catalog/constants/home-geo-map';
import { HomeGeoMapProjectSearch } from '@/features/catalog/components/home-geo-map-project-search';
import { GeoMapCanvasLazy } from '@/features/geo-map/components/geo-map-canvas-lazy';
import type { GeoMapFocusRequest, GeoMapObject } from '@/features/geo-map/types';
import { mapPublicGeoMapItemsToObjects } from '@/features/geo-map/utils/map-object-mapper';
import { GeoMapStatusOverlays } from '@/features/geo-map/public/components/geo-map-status-overlays';
import { usePublicGeoMapModelsQuery } from '@/features/geo-map/public/hooks/use-public-geo-map-models';
import { buildProjectPublicHref } from '@/features/geo-map/public/utils/build-project-public-href';
import { resolvePublicGeoMapView } from '@/features/geo-map/public/utils/resolve-public-geo-map-view';
import { useRouter } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

const findObjectById = (objects: GeoMapObject[], id: string): GeoMapObject | null =>
  objects.find((object) => object.id === id) ?? null;

/**
 * Home page 3D developments map — published geo-map models + project search fly-to.
 * Search sits above the map (not overlaid) so MapLibre/deck canvases cannot intercept clicks.
 */
export const HomeDevelopmentsMap = () => {
  const router = useRouter();
  const modelsQuery = usePublicGeoMapModelsQuery();
  const [focusRequest, setFocusRequest] = useState<GeoMapFocusRequest | undefined>(undefined);
  const [highlightedObjectId, setHighlightedObjectId] = useState<string | null>(null);

  const objects = useMemo(
    () => mapPublicGeoMapItemsToObjects(modelsQuery.data?.data ?? []),
    [modelsQuery.data?.data],
  );
  const view = useMemo(() => resolvePublicGeoMapView(objects), [objects]);
  const showEmpty = !modelsQuery.isLoading && !modelsQuery.isError && objects.length === 0;

  const onSelectProject = (object: GeoMapObject): void => {
    setHighlightedObjectId(object.id);
    setFocusRequest((prev) => ({
      objectId: object.id,
      token: (prev?.token ?? 0) + 1,
    }));
  };

  const onObjectClick = (id: string): void => {
    const object = findObjectById(objects, id);
    if (!object?.projectSlug) {
      return;
    }
    router.push(buildProjectPublicHref(object.projectSlug));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative z-20">
        <HomeGeoMapProjectSearch objects={objects} onSelect={onSelectProject} />
      </div>

      <div
        className={cn(
          'relative z-0 overflow-hidden rounded-[20px] bg-map-canvas',
          'ring-1 ring-header-border',
          HOME_GEO_MAP_HEIGHT_CLASS,
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
      </div>
    </div>
  );
};
