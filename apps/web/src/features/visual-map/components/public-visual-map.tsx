'use client';

import type { PublicVisualCanvasItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { PercentMapMarkers } from '@/features/visual-map/components/percent-map-markers';
import { PublicVisualHotspotSheet } from '@/features/visual-map/components/public-visual-hotspot-sheet';
import {
  buildBuildingFloorHref,
  buildFloorApartmentHref,
  buildProjectBuildingHref,
} from '@/features/visual-map/utils/public-visual-map';

/** Serializable link context — do not pass functions from RSC parents. */
export type PublicVisualMapLinkContext =
  | { kind: 'projectBuilding'; projectId: string }
  | { kind: 'buildingFloor'; projectId: string; buildingId: string }
  | { kind: 'floorApartment' };

type PublicVisualMapProps = {
  canvas: PublicVisualCanvasItem;
  linkContext: PublicVisualMapLinkContext;
};

/**
 * Public visual map with tappable SVG markers and optional bottom sheet.
 */
export const PublicVisualMap = ({ canvas, linkContext }: PublicVisualMapProps) => {
  const t = useTranslations('Catalog.visualMap');
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);

  const imageUrl = canvas.media.fileUrl;
  const hasHotspots = canvas.hotspots.length > 0;
  const selectedHotspot =
    canvas.hotspots.find((hotspot) => hotspot.id === selectedHotspotId) ?? null;
  const selectedTargetHref =
    selectedHotspot != null ? (targetHrefByHotspotId[selectedHotspot.id] ?? null) : null;

  const markers = canvas.hotspots.map((hotspot) => ({
    id: hotspot.id,
    label: hotspot.label,
    xPercent: hotspot.xPercent,
    yPercent: hotspot.yPercent,
    selected: selectedHotspotId === hotspot.id,
  }));

  return (
    <section className="mb-8 flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-ink">{canvas.title ?? t('title')}</h2>
        {hasHotspots ? <p className="text-xs text-ink-secondary">{t('viewAsList')}</p> : null}
      </div>
      <div className="relative w-full overflow-x-auto rounded-md border border-border bg-surface">
        <div className="relative min-w-[280px]">
          <img
            src={imageUrl}
            alt={canvas.media.altText ?? canvas.title ?? t('alt')}
            className="h-auto w-full"
          />
          {hasHotspots ? (
            <PercentMapMarkers
              markers={markers}
              interactive
              showLabels
              onSelectMarker={setSelectedHotspotId}
            />
          ) : null}
        </div>
      </div>
      {selectedHotspot && selectedTargetHref ? (
        <PublicVisualHotspotSheet
          hotspot={selectedHotspot}
          targetHref={resolveTargetHref(linkContext, selectedHotspot)}
          onClose={() => setSelectedHotspotId(null)}
        />
      ) : null}
    </section>
  );
};

const resolveTargetHref = (
  linkContext: PublicVisualMapLinkContext,
  hotspot: PublicVisualHotspotItem,
): string => {
  switch (linkContext.kind) {
    case 'projectBuilding':
      return buildProjectBuildingHref(linkContext.projectId, hotspot);
    case 'buildingFloor':
      return buildBuildingFloorHref(linkContext.projectId, linkContext.buildingId, hotspot);
    case 'floorApartment':
      return buildFloorApartmentHref(hotspot);
  }
};
