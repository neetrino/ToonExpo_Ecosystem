'use client';

import type { MediaAssetItem, PortalVisualCanvasDetail } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { Link } from '@/i18n/navigation';

import {
  createVisualCanvas,
  getVisualCanvas,
  listProjectVisualCanvases,
  updateVisualCanvas,
} from '../../api/interactive-mapping-api';
import { interactiveMappingProjectQueryKey } from '../../constants';
import { useInteractiveMappingProjectQuery } from '../../hooks/use-interactive-mapping';
import { useMappingCatalog } from '../../hooks/use-mapping-catalog';
import { DistrictBuildingEditor } from '../editors/district-building-editor';
import { MappingImageUploader } from '../media/mapping-image-uploader';

export type DistrictPhasePageProps = {
  projectId: string;
  districtId: string;
};

/**
 * Phase 2 page: district plan + building mapping.
 */
export const DistrictPhasePage = ({ projectId, districtId }: DistrictPhasePageProps) => {
  const t = useTranslations('Admin.interactiveMapping');
  const queryClient = useQueryClient();
  const detailQuery = useInteractiveMappingProjectQuery(projectId);
  const [canvas, setCanvas] = useState<PortalVisualCanvasDetail | null>(null);
  const [loadingCanvas, setLoadingCanvas] = useState(true);
  const [mediaId, setMediaId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const companyId = detailQuery.data?.project.builderCompanyId;
  const catalog = useMappingCatalog(companyId);

  useEffect(() => {
    if (!catalog) {
      return;
    }
    const { catalogScope } = catalog;
    let cancelled = false;
    const load = async () => {
      setLoadingCanvas(true);
      try {
        const list = await listProjectVisualCanvases(catalogScope, projectId);
        const match = list.data.find(
          (item) => item.contextType === 'district' && item.contextId === districtId,
        );
        if (!match) {
          if (!cancelled) {
            setCanvas(null);
          }
          return;
        }
        const detail = await getVisualCanvas(catalogScope, match.id);
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
  }, [catalog, districtId, projectId, t]);

  if (detailQuery.isLoading || loadingCanvas) {
    return <p className="text-sm text-ink-muted">{t('loading')}</p>;
  }

  if (detailQuery.isError || !detailQuery.data || !catalog) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t('error')}
      </p>
    );
  }

  const district = detailQuery.data.districts.find((item) => item.id === districtId);
  const buildings = detailQuery.data.buildings.filter(
    (item) => item.districtId === districtId || item.districtId == null,
  );

  if (!district) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t('error')}
      </p>
    );
  }

  const { catalogScope, mediaContext, basePath, mode } = catalog;

  const attachMedia = async (asset: MediaAssetItem) => {
    setError(null);
    setMediaId(asset.id);
    try {
      if (canvas) {
        setCanvas(
          await updateVisualCanvas(catalogScope, canvas.id, {
            mediaAssetId: asset.id,
            publicationStatus: 'published',
          }),
        );
      } else {
        setCanvas(
          await createVisualCanvas(catalogScope, projectId, {
            contextType: 'district',
            contextId: districtId,
            mediaAssetId: asset.id,
            title: `${district.name} plan`,
            isPrimary: true,
            publicationStatus: 'published',
          }),
        );
      }
      void queryClient.invalidateQueries({
        queryKey: interactiveMappingProjectQueryKey(projectId, mode),
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
          href={`${basePath}/${projectId}`}
          className="text-xs uppercase tracking-[0.14em] text-ink-muted underline-offset-4 hover:underline"
        >
          {t('backToWizard')}
        </Link>
        <h1 className="mt-3 font-display text-3xl text-ink">
          {t('pages.district', { name: district.name })}
        </h1>
      </div>

      <MappingImageUploader
        id="district-plan-image"
        label={t('forms.districtPlanImage')}
        context={mediaContext}
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

      {canvas ? (
        <DistrictBuildingEditor
          companyId={companyId!}
          canvasId={canvas.id}
          imageUrl={canvas.media.fileUrl}
          imageWidth={width}
          imageHeight={height}
          viewBoxWidth={width}
          viewBoxHeight={height}
          buildings={buildings}
          hotspots={canvas.hotspots}
          onAfterSave={() => {
            void queryClient.invalidateQueries({
              queryKey: interactiveMappingProjectQueryKey(projectId, mode),
            });
          }}
        />
      ) : (
        <p className="text-sm text-ink-muted">{t('forms.uploadFirst')}</p>
      )}
    </div>
  );
};
