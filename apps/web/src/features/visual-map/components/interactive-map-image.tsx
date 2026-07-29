'use client';

import type { PublicVisualCanvasItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useEffect, useState, type SyntheticEvent } from 'react';

import { PercentMapMarkers } from '@/features/visual-map/components/percent-map-markers';
import { PolygonHotspotOverlay } from '@/features/visual-map/components/polygon-hotspot-overlay';

const FALLBACK_VIEWBOX_WIDTH = 1000;
const FALLBACK_VIEWBOX_HEIGHT = 1000;

type InteractiveMapImageProps = {
  canvas: PublicVisualCanvasItem;
  selectedHotspotId: string | null;
  interactive: boolean;
  onSelectHotspot: (hotspotId: string) => void;
};

type ViewBoxSize = {
  width: number;
  height: number;
};

const resolveInitialViewBox = (canvas: PublicVisualCanvasItem): ViewBoxSize => {
  const width = canvas.media.width;
  const height = canvas.media.height;
  if (width != null && width > 0 && height != null && height > 0) {
    return { width, height };
  }
  return { width: FALLBACK_VIEWBOX_WIDTH, height: FALLBACK_VIEWBOX_HEIGHT };
};

/**
 * Stage image with proportional polygon + marker overlays (Admin coordinate contract).
 */
export const InteractiveMapImage = ({
  canvas,
  selectedHotspotId,
  interactive,
  onSelectHotspot,
}: InteractiveMapImageProps) => {
  const t = useTranslations('Catalog.visualMap');
  const [viewBox, setViewBox] = useState<ViewBoxSize>(() => resolveInitialViewBox(canvas));

  useEffect(() => {
    setViewBox(resolveInitialViewBox(canvas));
  }, [canvas]);

  const imageUrl = canvas.media.fileUrl;

  const pointMarkers = canvas.hotspots
    .filter((hotspot) => {
      // Polygons own the hit target — never stack a marker overlay on top of them.
      if (hotspot.svgPath != null && hotspot.svgPath.length > 0) {
        return false;
      }
      return (
        hotspot.shapeType === 'point' ||
        hotspot.interactionType === 'marker' ||
        hotspot.interactionType === 'both'
      );
    })
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

  const onImageLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    const hasStoredSize =
      canvas.media.width != null &&
      canvas.media.width > 0 &&
      canvas.media.height != null &&
      canvas.media.height > 0;
    if (hasStoredSize) {
      return;
    }

    const { naturalWidth, naturalHeight } = event.currentTarget;
    if (naturalWidth > 0 && naturalHeight > 0) {
      setViewBox({ width: naturalWidth, height: naturalHeight });
    }
  };

  return (
    <div className="relative min-w-[280px]">
      <img
        key={canvas.id}
        src={imageUrl}
        alt={canvas.media.altText ?? canvas.title ?? t('alt')}
        className="relative z-0 h-auto w-full select-none"
        draggable={false}
        onLoad={onImageLoad}
      />
      {polygonItems.length > 0 ? (
        <PolygonHotspotOverlay
          items={polygonItems}
          viewBoxWidth={viewBox.width}
          viewBoxHeight={viewBox.height}
          interactive={interactive}
          onSelect={onSelectHotspot}
        />
      ) : null}
      {pointMarkers.length > 0 ? (
        <PercentMapMarkers
          markers={pointMarkers}
          interactive={interactive}
          showLabels={false}
          onSelectMarker={onSelectHotspot}
        />
      ) : null}
    </div>
  );
};
