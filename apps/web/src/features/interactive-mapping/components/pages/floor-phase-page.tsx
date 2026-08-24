'use client';

import type { MediaAssetItem, PortalVisualCanvasDetail } from '@toonexpo/contracts';
import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { Fragment, useEffect, useState } from 'react';

import {
  createPortalApartment,
  deletePortalApartment,
} from '@/features/builder/api/portal-apartments-api';
import { useRouter } from '@/i18n/navigation';
import { BackLink } from '@/shared/ui/back-link';

import {
  clearAttachedVisualCanvas,
  createVisualCanvas,
  getVisualCanvas,
  listProjectVisualCanvases,
  updateVisualCanvas,
} from '../../api/interactive-mapping-api';
import { interactiveMappingProjectQueryKey } from '../../constants';
import { useInteractiveMappingProjectQuery } from '../../hooks/use-interactive-mapping';
import { useMappingCatalog } from '../../hooks/use-mapping-catalog';
import { FloorApartmentMappingEditor } from '../editors/floor-apartment-mapping-editor';
import { FloorPlanUploadPicker } from '../floor-plan-upload-picker';
import { FloorPolygonRequiredGate } from '../floor-polygon-required-gate';
import { CreateEntityInlineForm } from '../forms/create-entity-inline-form';
import { MappingImageUploader } from '../media/mapping-image-uploader';
import { isFloorPlanMappingUnlocked } from '../../utils/is-floor-plan-mapping-unlocked';

export type FloorPhasePageProps = {
  projectId: string;
  floorId: string;
};

/**
 * Phase 4 page: floor plan + apartment mapping.
 * Floors without a building-render polygon are soft-locked until Phase 3 is done for them.
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
  const [lockNotice, setLockNotice] = useState<string | null>(null);

  const companyId = detailQuery.data?.project.builderCompanyId;
  const catalog = useMappingCatalog(companyId);
  const catalogScope = catalog?.catalogScope;

  useEffect(() => {
    if (!catalogScope) {
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoadingCanvas(true);
      try {
        const list = await listProjectVisualCanvases(catalogScope, projectId);
        const match = list.data.find(
          (item) => item.contextType === 'floor' && item.contextId === floorId,
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
  }, [catalogScope, floorId, projectId, t]);

  useEffect(() => {
    setLockNotice(null);
  }, [floorId]);

  if (detailQuery.isLoading || loadingCanvas) {
    return <p className="text-sm text-ink-muted">{t('loading')}</p>;
  }

  if (detailQuery.isError || !detailQuery.data || !catalog || !catalogScope || !companyId) {
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
  const building = detailQuery.data.buildings.find((item) => item.id === floor.buildingId);
  const district = detailQuery.data.districts.find((item) => item.id === building?.districtId);
  const { mediaContext, basePath, mode } = catalog;
  const apartmentsBuildingHref = `${basePath}/${projectId}/phases/apartments/buildings/${floor.buildingId}`;
  const buildingRenderHref = `${basePath}/${projectId}/buildings/${floor.buildingId}/render`;
  const floorUnlocked = isFloorPlanMappingUnlocked(floor);
  const floorLabel = floor.name ?? `Floor ${floor.number}`;
  const pathSegments = [district?.name ?? '—', building?.name ?? '—', floorLabel];

  const attachMedia = async (asset: MediaAssetItem) => {
    if (!floorUnlocked) {
      setLockNotice(t('forms.floorNeedsPolygon'));
      return;
    }
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
            contextType: 'floor',
            contextId: floorId,
            mediaAssetId: asset.id,
            title: floor.name ?? `Floor ${floor.number}`,
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

  const clearMedia = async () => {
    if (!canvas) {
      setMediaId('');
      return;
    }
    setError(null);
    try {
      await clearAttachedVisualCanvas(catalogScope, canvas);
      setCanvas(null);
      setMediaId('');
      void queryClient.invalidateQueries({
        queryKey: interactiveMappingProjectQueryKey(projectId, mode),
      });
    } catch (clearError) {
      setError(clearError instanceof Error ? clearError.message : t('error'));
      throw clearError;
    }
  };

  const width = canvas?.media.width ?? 1600;
  const height = canvas?.media.height ?? 900;

  return (
    <div className="space-y-6">
      <div>
        <BackLink href={apartmentsBuildingHref} label={t('backToWizard')} />
        <h1 className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-3xl text-ink">
          {pathSegments.map((segment, index) => (
            <Fragment key={`${segment}-${index}`}>
              {index > 0 ? (
                <ChevronRight
                  className="size-6 shrink-0 text-ink-muted"
                  strokeWidth={2}
                  aria-hidden
                />
              ) : null}
              <span className="min-w-0">{segment}</span>
            </Fragment>
          ))}
        </h1>
      </div>

      <FloorPlanUploadPicker
        floors={siblingFloors}
        selectedFloorId={floorId}
        title={t('forms.pickFloor')}
        emptyLabel={t('forms.noFloors')}
        lockedHint={t('forms.floorNeedsPolygon')}
        planReadyLabel={t('forms.planReady')}
        needsPolygonLabel={t('forms.needsPolygon')}
        onSelectFloor={(nextFloorId) => {
          setLockNotice(null);
          router.push(`${basePath}/${projectId}/floors/${nextFloorId}`);
        }}
        onSelectLockedFloor={(lockedFloor) => {
          setLockNotice(
            t('forms.floorNeedsPolygonNamed', {
              name: lockedFloor.name ?? String(lockedFloor.number),
            }),
          );
        }}
      />

      {lockNotice ? (
        <p role="status" className="text-sm text-ink-muted">
          {lockNotice}
        </p>
      ) : null}

      {!floorUnlocked ? (
        <FloorPolygonRequiredGate
          floorLabel={floorLabel}
          message={t('forms.floorNeedsPolygon')}
          ctaLabel={t('forms.goToBuildingRender')}
          buildingRenderHref={buildingRenderHref}
        />
      ) : (
        <>
          <MappingImageUploader
            id="floor-plan-image"
            label={t('forms.floorPlanImage')}
            context={mediaContext}
            value={mediaId}
            previewUrl={canvas?.media.fileUrl}
            onChange={(asset) => {
              void attachMedia(asset);
            }}
            onClear={clearMedia}
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
              createForm={
                <CreateEntityInlineForm
                  title={t('forms.createApartment')}
                  submitLabel={t('forms.createApartment')}
                  pendingLabel={t('forms.saving')}
                  nameLabel={t('forms.apartmentNumber')}
                  namePlaceholder={t('forms.apartmentPlaceholder')}
                  digitsOnly
                  onSubmit={async (number) => {
                    await createPortalApartment(floorId, { number }, { scope: catalogScope });
                    void queryClient.invalidateQueries({
                      queryKey: interactiveMappingProjectQueryKey(projectId, mode),
                    });
                  }}
                />
              }
              onDeleteApartment={async (apartmentId) => {
                await deletePortalApartment(apartmentId, { scope: catalogScope });
                void queryClient.invalidateQueries({
                  queryKey: interactiveMappingProjectQueryKey(projectId, mode),
                });
              }}
              onAfterSave={() => {
                void queryClient.invalidateQueries({
                  queryKey: interactiveMappingProjectQueryKey(projectId, mode),
                });
              }}
            />
          ) : (
            <p className="text-sm text-ink-muted">{t('forms.uploadFirst')}</p>
          )}
        </>
      )}
    </div>
  );
};
