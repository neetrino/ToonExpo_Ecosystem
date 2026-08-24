'use client';

import type { PublicVisualCanvasItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { isApiErrorStatus } from '@/shared/api/errors';
import { InteractiveMapImage } from '@/features/visual-map/components/interactive-map-image';
import { resolveHotspotHref } from '@/features/visual-map/utils/public-visual-map';
import { useRouter } from '@/i18n/navigation';

type PublicVisualMapProps = {
  canvas: PublicVisualCanvasItem;
  projectId: string;
  projectSlug: string;
};

/**
 * Public interactive map — polygon clicks navigate to refresh-safe path URLs
 * (district / building / floor / apartment pages).
 */
export const PublicVisualMap = ({ canvas, projectId, projectSlug }: PublicVisualMapProps) => {
  const t = useTranslations('Catalog.visualMap');
  const router = useRouter();
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const interactive = !isNavigating && canvas.hotspots.length > 0;

  useEffect(() => {
    setSelectedHotspotId(null);
    setErrorMessage(null);
    setIsNavigating(false);
  }, [canvas.id]);

  const openHotspot = (hotspotId: string): void => {
    if (isNavigating) {
      return;
    }

    const hotspot = canvas.hotspots.find((item) => item.id === hotspotId);
    if (!hotspot) {
      return;
    }

    setSelectedHotspotId(hotspotId);
    setErrorMessage(null);
    setIsNavigating(true);

    void (async () => {
      try {
        const href = await resolveHotspotHref(projectId, projectSlug, hotspot, canvas);
        if (!href) {
          setErrorMessage(t('stageUnavailable'));
          setIsNavigating(false);
          return;
        }
        router.push(href);
      } catch (error) {
        if (isApiErrorStatus(error, 404)) {
          setErrorMessage(t('stageUnavailable'));
        } else {
          setErrorMessage(t('stageLoadError'));
        }
        setIsNavigating(false);
      }
    })();
  };

  return (
    <section className="mb-8 flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-ink">{canvas.title ?? t('title')}</h2>
      </div>

      <div
        className={`relative w-full overflow-x-auto rounded-md border border-border bg-surface transition-opacity duration-200 ${
          isNavigating ? 'opacity-70' : 'opacity-100'
        }`}
      >
        <InteractiveMapImage
          canvas={canvas}
          selectedHotspotId={selectedHotspotId}
          interactive={interactive}
          onSelectHotspot={openHotspot}
        />
      </div>

      {errorMessage ? (
        <p role="alert" className="text-sm text-danger">
          {errorMessage}
        </p>
      ) : null}
    </section>
  );
};
