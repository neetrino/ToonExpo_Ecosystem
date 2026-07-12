'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useState, useTransition } from 'react';

import { VisualMapFormError } from '@/components/visual-map/visual-map-form-error';
import type { BuilderArchivedHotspot } from '@/lib/visual-map/queries';
import type { VisualMapMutationErrorKey } from '@/lib/visual-map/mutation-result';

import { restoreHotspotAction } from '../../../../visual-map-actions';

type CanvasArchivedHotspotsProps = {
  locale: string;
  archivedHotspots: BuilderArchivedHotspot[];
};

export function CanvasArchivedHotspots({ locale, archivedHotspots }: CanvasArchivedHotspotsProps) {
  const t = useTranslations('portal.visualMap.editor');
  const [showArchived, setShowArchived] = useState(false);

  if (archivedHotspots.length === 0) {
    return null;
  }

  return (
    <section className="portal-visual-map-archived">
      <button
        type="button"
        className="portal-btn portal-btn--ghost portal-btn--sm"
        onClick={() => setShowArchived((value) => !value)}
      >
        {showArchived ? t('hideArchived') : t('showArchived', { count: archivedHotspots.length })}
      </button>

      {showArchived ? (
        <ul className="portal-visual-map-archived__list">
          {archivedHotspots.map((hotspot) => (
            <ArchivedHotspotRow key={hotspot.id} locale={locale} hotspot={hotspot} />
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function ArchivedHotspotRow({
  locale,
  hotspot,
}: {
  locale: string;
  hotspot: BuilderArchivedHotspot;
}) {
  const t = useTranslations('portal.visualMap.editor');
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errorKey, setErrorKey] = useState<VisualMapMutationErrorKey | undefined>();

  function handleRestore(): void {
    setErrorKey(undefined);
    startTransition(async () => {
      const result = await restoreHotspotAction(locale, { hotspotId: hotspot.id });
      if (!result.ok) {
        setErrorKey(result.errorKey);
        return;
      }
      router.refresh();
    });
  }

  const label = hotspot.label ?? t('marker');

  return (
    <li className="portal-visual-map-archived__item">
      <span>
        {label} ({hotspot.x.toFixed(1)}%, {hotspot.y.toFixed(1)}%)
      </span>
      <button
        type="button"
        className="portal-btn portal-btn--ghost portal-btn--sm"
        disabled={pending}
        onClick={handleRestore}
      >
        {t('restoreHotspot')}
      </button>
      <VisualMapFormError errorKey={errorKey} />
    </li>
  );
}
