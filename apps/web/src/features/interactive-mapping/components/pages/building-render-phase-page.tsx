'use client';

import type { MediaAssetItem, PortalVisualCanvasDetail } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { Link } from '@/i18n/navigation';

import {
  createAdminVisualCanvas,
  getAdminVisualCanvas,
  listAdminProjectVisualCanvases,
  updateAdminVisualCanvas,
} from '../../api/interactive-mapping-api';
import { INTERACTIVE_MAPPING_BASE_PATH, interactiveMappingProjectQueryKey } from '../../constants';
import {
  useInteractiveMappingProjectQuery,
  useSetupBuildingFloorsMutation,
} from '../../hooks/use-interactive-mapping';
import { BuildingFloorSetupForm } from '../building-floor-setup-form';
import { BuildingFloorMappingEditor } from '../editors/building-floor-mapping-editor';
import { MappingImageUploader } from '../media/mapping-image-uploader';

export type BuildingRenderPhasePageProps = {
  projectId: string;
  buildingId: string;
};

/**
 * Phase 3 page: building render + floor bands.
 */
export const BuildingRenderPhasePage = ({
  projectId,
  buildingId,
}: BuildingRenderPhasePageProps) => {
  const t = useTranslations('Admin.interactiveMapping');
  const queryClient = useQueryClient();
  const detailQuery = useInteractiveMappingProjectQuery(projectId);
  const setupFloors = useSetupBuildingFloorsMutation(projectId);
  const [canvas, setCanvas] = useState<PortalVisualCanvasDetail | null>(null);
  const [loadingCanvas, setLoadingCanvas] = useState(true);
  const [mediaId, setMediaId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const companyId = detailQuery.data?.project.builderCompanyId;

  useEffect(() => {
    if (!companyId) {
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoadingCanvas(true);
      try {
        const list = await listAdminProjectVisualCanvases(companyId, projectId);
        const match = list.data.find(
          (item) => item.contextType === 'building' && item.contextId === buildingId,
        );
        if (!match) {
          if (!cancelled) {
            setCanvas(null);
          }
          return;
        }
        const detail = await getAdminVisualCanvas(companyId, match.id);
        if (!cancelled) {
          setCanvas(detail);
          setMediaId(detail.mediaAssetId);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : t('error'));
        }
      } finally {
        if (!cancelled) {
          setLoadingCanvas(false);
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [buildingId, companyId, projectId, t]);

  if (detailQuery.isLoading || loadingCanvas) {
    return <p className="text-sm text-ink-muted">{t('loading')}</p>;
  }

  if (detailQuery.isError || !detailQuery.data || !companyId) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t('error')}
      </p>
    );
  }

  const building = detailQuery.data.buildings.find((item) => item.id === buildingId);
  const floors = detailQuery.data.floors.filter((item) => item.buildingId === buildingId);

  if (!building) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t('error')}
      </p>
    );
  }

  const attachMedia = async (asset: MediaAssetItem) => {
    setError(null);
    setMediaId(asset.id);
    try {
      if (canvas) {
        setCanvas(
          await updateAdminVisualCanvas(companyId, canvas.id, {
            mediaAssetId: asset.id,
            publicationStatus: 'published',
          }),
        );
      } else {
        setCanvas(
          await createAdminVisualCanvas(companyId, projectId, {
            contextType: 'building',
            contextId: buildingId,
            mediaAssetId: asset.id,
            title: `${building.name} render`,
            isPrimary: true,
            publicationStatus: 'published',
          }),
        );
      }
      void queryClient.invalidateQueries({
        queryKey: interactiveMappingProjectQueryKey(projectId),
      });
    } catch (attachError) {
      setError(attachError instanceof Error ? attachError.message : t('error'));
    }
  };

  const width = canvas?.media.width ?? 900;
  const height = canvas?.media.height ?? 1600;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`${INTERACTIVE_MAPPING_BASE_PATH}/${projectId}`}
          className="text-xs uppercase tracking-[0.14em] text-ink-muted underline-offset-4 hover:underline"
        >
          {t('backToWizard')}
        </Link>
        <h1 className="mt-3 font-display text-3xl text-ink">
          {t('pages.buildingRender', { name: building.name })}
        </h1>
      </div>

      <BuildingFloorSetupForm
        buildingName={building.name}
        initialFloorCount={building.floorsCount ?? floors.length ?? 1}
        submitLabel={t('forms.setupFloors')}
        pendingLabel={t('forms.saving')}
        floorCountLabel={t('forms.floorCount')}
        hint={t('hints.setupFloors')}
        onSubmit={async (floorCount) => {
          await setupFloors.mutateAsync({
            buildingId,
            body: {
              floorCount,
              ...(mediaId ? { renderMediaAssetId: mediaId } : {}),
            },
          });
        }}
      />

      <MappingImageUploader
        id="building-render-image"
        label={t('forms.buildingRenderImage')}
        context={{ companyId }}
        value={mediaId}
        previewUrl={canvas?.media.fileUrl}
        onChange={(asset) => {
          void attachMedia(asset);
        }}
      />

      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}

      {canvas && floors.length > 0 ? (
        <BuildingFloorMappingEditor
          companyId={companyId}
          canvasId={canvas.id}
          imageUrl={canvas.media.fileUrl}
          imageWidth={width}
          imageHeight={height}
          viewBoxWidth={width}
          viewBoxHeight={height}
          floors={floors.map((floor) => ({
            id: floor.id,
            name: floor.name ?? `Floor ${floor.number}`,
            number: floor.number,
          }))}
          hotspots={canvas.hotspots}
          onAfterSave={() => {
            void queryClient.invalidateQueries({
              queryKey: interactiveMappingProjectQueryKey(projectId),
            });
          }}
        />
      ) : (
        <p className="text-sm text-ink-muted">{t('forms.uploadAndSetupFloors')}</p>
      )}
    </div>
  );
};
