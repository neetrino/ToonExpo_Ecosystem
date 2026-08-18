'use client';

import { useMemo } from 'react';

import { PROJECT_CATALOG_GEO_MAP_HEIGHT_CLASS } from '@/features/catalog/constants/project-catalog-geo-map';
import { resolveMapObjectForProject } from '@/features/catalog/utils/resolve-map-object-for-project';
import { GeoMapCanvasLazy } from '@/features/geo-map/components/geo-map-canvas-lazy';
import { mapPublicGeoMapItemsToObjects } from '@/features/geo-map/utils/map-object-mapper';
import { GeoMapStatusOverlays } from '@/features/geo-map/public/components/geo-map-status-overlays';
import { usePublicGeoMapModelsQuery } from '@/features/geo-map/public/hooks/use-public-geo-map-models';
import { resolvePublicGeoMapView } from '@/features/geo-map/public/utils/resolve-public-geo-map-view';
import { resolveFocusCamera } from '@/features/geo-map/utils/resolve-focus-camera';
import { cn } from '@/shared/ui/cn';

type ProjectCatalogGeoMapProps = {
  projectId: string;
};

/**
 * Project-detail Map — same public 3D canvas as `/map`, with only this project's pin.
 */
export const ProjectCatalogGeoMap = ({ projectId }: ProjectCatalogGeoMapProps) => {
  const modelsQuery = usePublicGeoMapModelsQuery();
  const isModelsReady = !modelsQuery.isLoading;

  const projectObjects = useMemo(() => {
    const objects = mapPublicGeoMapItemsToObjects(modelsQuery.data?.data ?? []);
    const match = resolveMapObjectForProject(objects, projectId);
    return match ? [match] : [];
  }, [modelsQuery.data?.data, projectId]);
  const projectObject = projectObjects[0] ?? null;
  const view = useMemo(
    () => (projectObject ? resolveFocusCamera(projectObject) : resolvePublicGeoMapView([])),
    [projectObject],
  );
  const showEmpty = isModelsReady && !modelsQuery.isError && projectObject == null;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-map-canvas',
        'ring-1 ring-header-border',
        PROJECT_CATALOG_GEO_MAP_HEIGHT_CLASS,
      )}
    >
      {isModelsReady && !modelsQuery.isError ? (
        <GeoMapCanvasLazy
          objects={projectObjects}
          initialCenter={view.center}
          initialZoom={view.zoom}
          highlightedObjectId={projectObject?.id ?? null}
          className="absolute inset-0 h-full w-full"
        />
      ) : null}
      <GeoMapStatusOverlays
        isLoading={!isModelsReady}
        isError={modelsQuery.isError}
        isEmpty={showEmpty}
        onRetry={() => void modelsQuery.refetch()}
      />
    </div>
  );
};
