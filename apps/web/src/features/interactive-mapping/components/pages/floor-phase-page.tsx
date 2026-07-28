'use client';

import type { MediaAssetItem, PortalVisualCanvasDetail } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { createPortalApartment } from '@/features/builder/api/portal-apartments-api';
import { Link, useRouter } from '@/i18n/navigation';

import {
  adminCatalogScope,
  createAdminVisualCanvas,
  getAdminVisualCanvas,
  listAdminProjectVisualCanvases,
  updateAdminVisualCanvas,
} from '../../api/interactive-mapping-api';
import { INTERACTIVE_MAPPING_BASE_PATH, interactiveMappingProjectQueryKey } from '../../constants';
import { useInteractiveMappingProjectQuery } from '../../hooks/use-interactive-mapping';
import { FloorApartmentMappingEditor } from '../editors/floor-apartment-mapping-editor';
import { FloorPlanUploadPicker } from '../floor-plan-upload-picker';
import { CreateEntityInlineForm } from '../forms/create-entity-inline-form';
import { MappingImageUploader } from '../media/mapping-image-uploader';

export type FloorPhasePageProps = {
  projectId: string;
  floorId: string;
};

/**
 * Phase 4 page: floor plan + apartment mapping.
 */
export const FloorPhasePage = ({ projectId, floorId }: FloorPhasePageProps) => {
  const t = useTranslations('Admin.interactiveMapping');
  const router = useRouter();
  const queryClient = useQueryClient();
  const detailQuery = useInteractiveMappingProjectQuery(projectId);
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
          (item) => item.contextType === 'floor' && item.contextId === floorId,
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
  }, [companyId, floorId, projectId, t]);

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

  const floor = detailQuery.data.floors.find((item) => item.id === floorId);
  if (!floor) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t('error')}
      </p>
    );
  }

  const siblingFloors = detailQuery.data.floors.filter(
    (item) => item.buildingId === floor.buildingId,
  );
  const apartments = detailQuery.data.apartments.filter((item) => item.floorId === floorId);
  const scope = adminCatalogScope(companyId);

  const attachMedia = async (asset: MediaAssetItem) => {
    setError(null);
    setMediaId(asset.id);
    try {
      if (canvas) {
        setCanvas(await updateAdminVisualCanvas(companyId, canvas.id, { mediaAssetId: asset.id }));
      } else {
        setCanvas(
          await createAdminVisualCanvas(companyId, projectId, {
            contextType: 'floor',
            contextId: floorId,
            mediaAssetId: asset.id,
            title: floor.name ?? `Floor ${floor.number}`,
            isPrimary: true,
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

  const width = canvas?.media.width ?? 1600;
  const height = canvas?.media.height ?? 900;

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
          {t('pages.floor', { name: floor.name ?? String(floor.number) })}
        </h1>
      </div>

      <FloorPlanUploadPicker
        floors={siblingFloors}
        selectedFloorId={floorId}
        title={t('forms.pickFloor')}
        emptyLabel={t('forms.noFloors')}
        onSelectFloor={(nextFloorId) => {
          router.push(`${INTERACTIVE_MAPPING_BASE_PATH}/${projectId}/floors/${nextFloorId}`);
        }}
      />

      <MappingImageUploader
        id="floor-plan-image"
        label={t('forms.floorPlanImage')}
        context={{ companyId }}
        value={mediaId}
        previewUrl={canvas?.media.fileUrl}
        onChange={(asset) => {
          void attachMedia(asset);
        }}
      />

      <CreateEntityInlineForm
        title={t('forms.createApartment')}
        submitLabel={t('forms.createApartment')}
        pendingLabel={t('forms.saving')}
        nameLabel={t('forms.apartmentNumber')}
        namePlaceholder={t('forms.apartmentPlaceholder')}
        onSubmit={async (number) => {
          await createPortalApartment(floorId, { number }, { scope });
          void queryClient.invalidateQueries({
            queryKey: interactiveMappingProjectQueryKey(projectId),
          });
        }}
      />

      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}

      {canvas ? (
        <FloorApartmentMappingEditor
          companyId={companyId}
          canvasId={canvas.id}
          imageUrl={canvas.media.fileUrl}
          imageWidth={width}
          imageHeight={height}
          viewBoxWidth={width}
          viewBoxHeight={height}
          apartments={apartments}
          hotspots={canvas.hotspots}
          onAfterSave={() => {
            void queryClient.invalidateQueries({
              queryKey: interactiveMappingProjectQueryKey(projectId),
            });
          }}
        />
      ) : (
        <p className="text-sm text-ink-muted">{t('forms.uploadFirst')}</p>
      )}
    </div>
  );
};
