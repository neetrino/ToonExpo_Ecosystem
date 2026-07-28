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
import { useInteractiveMappingProjectQuery } from '../../hooks/use-interactive-mapping';
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
          (item) => item.contextType === 'district' && item.contextId === districtId,
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
  }, [companyId, districtId, projectId, t]);

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

  const attachMedia = async (asset: MediaAssetItem) => {
    setError(null);
    setMediaId(asset.id);
    try {
      if (canvas) {
        setCanvas(await updateAdminVisualCanvas(companyId, canvas.id, { mediaAssetId: asset.id }));
      } else {
        setCanvas(
          await createAdminVisualCanvas(companyId, projectId, {
            contextType: 'district',
            contextId: districtId,
            mediaAssetId: asset.id,
            title: `${district.name} plan`,
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
          {t('pages.district', { name: district.name })}
        </h1>
      </div>

      <MappingImageUploader
        id="district-plan-image"
        label={t('forms.districtPlanImage')}
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

      {canvas ? (
        <DistrictBuildingEditor
          companyId={companyId}
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
