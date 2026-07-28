'use client';

import type { PublicVisualCanvasItem, PublicVisualHotspotItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { PercentMapMarkers } from '@/features/visual-map/components/percent-map-markers';
import { PolygonHotspotOverlay } from '@/features/visual-map/components/polygon-hotspot-overlay';
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
 * Public visual map with tappable markers and polygon overlays.
 */
export const PublicVisualMap = ({ canvas, linkContext }: PublicVisualMapProps) => {
  const t = useTranslations('Catalog.visualMap');
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);

  const imageUrl = canvas.media.fileUrl;
  const hasHotspots = canvas.hotspots.length > 0;
  const selectedHotspot =
    canvas.hotspots.find((hotspot) => hotspot.id === selectedHotspotId) ?? null;

  const pointMarkers = canvas.hotspots
    .filter(
      (hotspot) =>
        hotspot.shapeType === 'point' ||
        hotspot.interactionType === 'marker' ||
        hotspot.interactionType === 'both' ||
        !hotspot.svgPath,
    )
    .map((hotspot) => ({
      id: hotspot.id,
      label: hotspot.label,
      xPercent: hotspot.xPercent,
      yPercent: hotspot.yPercent,
      selected: selectedHotspotId === hotspot.id,
    }));

  const polygonItems = canvas.hotspots
    .filter((hotspot) => hotspot.svgPath != null && hotspot.svgPath.length > 0)
    .map((hotspot) => ({
      id: hotspot.id,
      label: hotspot.label,
      svgPath: hotspot.svgPath as string,
      selected: selectedHotspotId === hotspot.id,
    }));

  const viewBoxWidth = canvas.media.width ?? 1000;
  const viewBoxHeight = canvas.media.height ?? 1000;

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
          {polygonItems.length > 0 ? (
            <PolygonHotspotOverlay
              items={polygonItems}
              viewBoxWidth={viewBoxWidth}
              viewBoxHeight={viewBoxHeight}
              interactive
              onSelect={setSelectedHotspotId}
            />
          ) : null}
          {pointMarkers.length > 0 ? (
            <PercentMapMarkers
              markers={pointMarkers}
              interactive
              showLabels
              onSelectMarker={setSelectedHotspotId}
            />
          ) : null}
        </div>
      </div>
      {selectedHotspot ? (
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
