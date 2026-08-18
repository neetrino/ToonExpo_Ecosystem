'use client';

import { useMemo } from 'react';

import { PROJECT_CATALOG_GEO_MAP_HEIGHT_CLASS } from '@/features/catalog/constants/project-catalog-geo-map';
import { resolveMapObjectForProject } from '@/features/catalog/utils/resolve-map-object-for-project';
import { GeoMapCanvasLazy } from '@/features/geo-map/components/geo-map-canvas-lazy';
import { mapPublicGeoMapItemsToObjects } from '@/features/geo-map/utils/map-object-mapper';
import { GeoMapStatusOverlays } from '@/features/geo-map/public/components/geo-map-status-overlays';
import { usePublicGeoMapModelsQuery } from '@/features/geo-map/public/hooks/use-public-geo-map-models';
import { resolvePublicGeoMapView } from '@/features/geo-map/public/utils/resolve-public-geo-map-view';
import { cn } from '@/shared/ui/cn';

type ProjectCatalogGeoMapProps = {
  projectId: string;
};

/**
 * Project-detail Map card — the public 3D map with only this project's pin.
 */
export const ProjectCatalogGeoMap = ({ projectId }: ProjectCatalogGeoMapProps) => {
  const modelsQuery = usePublicGeoMapModelsQuery();

  const projectObjects = useMemo(() => {
    const objects = mapPublicGeoMapItemsToObjects(modelsQuery.data?.data ?? []);
    const projectObject = resolveMapObjectForProject(objects, projectId);
    return projectObject ? [projectObject] : [];
  }, [modelsQuery.data?.data, projectId]);
  const view = useMemo(() => resolvePublicGeoMapView(projectObjects), [projectObjects]);
  const showEmpty = !modelsQuery.isLoading && !modelsQuery.isError && projectObjects.length === 0;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-map-canvas',
        'ring-1 ring-header-border',
        PROJECT_CATALOG_GEO_MAP_HEIGHT_CLASS,
      )}
    >
      <GeoMapCanvasLazy
        objects={projectObjects}
        initialCenter={view.center}
        initialZoom={view.zoom}
        highlightedObjectId={projectObjects[0]?.id ?? null}
        className="absolute inset-0 h-full w-full"
      />
      <GeoMapStatusOverlays
        isLoading={modelsQuery.isLoading}
        isError={modelsQuery.isError}
        isEmpty={showEmpty}
        onRetry={() => void modelsQuery.refetch()}
      />
    </div>
  );
};
