'use client';

import type { PublicVisualCanvasItem, PublicVisualHotspotItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { isApiErrorStatus } from '@/shared/api/errors';
import { InteractiveMapImage } from '@/features/visual-map/components/interactive-map-image';
import {
  buildApartmentHref,
  buildBuildingFallbackHref,
  fetchCanvasForHotspotTarget,
  isDrillDownTargetType,
} from '@/features/visual-map/utils/public-visual-map';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';

type PublicVisualMapProps = {
  canvas: PublicVisualCanvasItem;
  projectId: string;
};

/**
 * Public interactive map drill-down: Admin-configured polygons navigate stage → stage.
 */
export const PublicVisualMap = ({ canvas, projectId }: PublicVisualMapProps) => {
  const t = useTranslations('Catalog.visualMap');
  const router = useRouter();
  const [stageStack, setStageStack] = useState<PublicVisualCanvasItem[]>([canvas]);
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingStage, setIsLoadingStage] = useState(false);

  const currentCanvas = stageStack[stageStack.length - 1] ?? canvas;
  const canGoBack = stageStack.length > 1;
  const interactive = !isLoadingStage && currentCanvas.hotspots.length > 0;

  useEffect(() => {
    setStageStack([canvas]);
    setSelectedHotspotId(null);
    setErrorMessage(null);
    setIsLoadingStage(false);
  }, [canvas.id]);

  const goBack = () => {
    if (isLoadingStage) {
      return;
    }
    setErrorMessage(null);
    setSelectedHotspotId(null);
    setStageStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  const navigateToStage = async (hotspot: PublicVisualHotspotItem) => {
    setIsLoadingStage(true);
    setErrorMessage(null);

    try {
      const nextCanvas = await fetchCanvasForHotspotTarget(hotspot);

      if (nextCanvas) {
        setStageStack((prev) => [...prev, nextCanvas]);
        setSelectedHotspotId(null);
        return;
      }

      if (hotspot.target.type === 'building') {
        router.push(buildBuildingFallbackHref(projectId, hotspot.target.id));
        return;
      }

      setErrorMessage(t('stageUnavailable'));
    } catch (error) {
      if (isApiErrorStatus(error, 404)) {
        setErrorMessage(t('stageUnavailable'));
        return;
      }
      setErrorMessage(t('stageLoadError'));
    } finally {
      setIsLoadingStage(false);
    }
  };

  const openHotspot = (hotspotId: string) => {
    if (isLoadingStage) {
      return;
    }

    const hotspot = currentCanvas.hotspots.find((item) => item.id === hotspotId);
    if (!hotspot) {
      return;
    }

    setSelectedHotspotId(hotspotId);
    setErrorMessage(null);

    if (hotspot.target.type === 'apartment') {
      router.push(buildApartmentHref(hotspot.target.id));
      return;
    }

    if (!isDrillDownTargetType(hotspot.target.type)) {
      return;
    }

    void navigateToStage(hotspot);
  };

  return (
    <section className="mb-8 flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-ink">{currentCanvas.title ?? t('title')}</h2>
        {canGoBack ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={goBack}
            disabled={isLoadingStage}
          >
            {t('back')}
          </Button>
        ) : null}
      </div>

      <div
        className={`relative w-full overflow-x-auto rounded-md border border-border bg-surface transition-opacity duration-200 ${
          isLoadingStage ? 'opacity-70' : 'opacity-100'
        }`}
      >
        <InteractiveMapImage
          canvas={currentCanvas}
          selectedHotspotId={selectedHotspotId}
          interactive={interactive}
          onSelectHotspot={openHotspot}
        />
        {isLoadingStage ? (
          <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs text-ink-secondary">
            {t('loadingStage')}
          </p>
        ) : null}
      </div>

      {errorMessage ? <p className="text-sm text-danger">{errorMessage}</p> : null}

      {!interactive && !isLoadingStage && currentCanvas.hotspots.length === 0 ? (
        <p className="text-sm text-ink-secondary">{t('finalStage')}</p>
      ) : null}
    </section>
  );
};
