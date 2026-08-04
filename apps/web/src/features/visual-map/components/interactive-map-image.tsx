'use client';

import type { PublicVisualCanvasItem, VisualMapContextType } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useEffect, useState, type SyntheticEvent } from 'react';

import { PercentMapMarkers } from '@/features/visual-map/components/percent-map-markers';
import { PolygonHotspotOverlay } from '@/features/visual-map/components/polygon-hotspot-overlay';
import {
  PUBLIC_VISUAL_MAP_CONTAINED_CONTEXT_TYPES,
  PUBLIC_VISUAL_MAP_CONTAINED_MAX_HEIGHT_CLASS,
} from '@/features/visual-map/constants';
import { isFillableSvgPath } from '@/features/visual-map/utils/is-fillable-svg-path';

const FALLBACK_VIEWBOX_WIDTH = 1000;
const FALLBACK_VIEWBOX_HEIGHT = 1000;

const isContainedStageContext = (contextType: VisualMapContextType): boolean =>
  (PUBLIC_VISUAL_MAP_CONTAINED_CONTEXT_TYPES as readonly VisualMapContextType[]).includes(
    contextType,
  );

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
  const mediaWidth = canvas.media.width;
  const mediaHeight = canvas.media.height;

  useEffect(() => {
    if (mediaWidth != null && mediaWidth > 0 && mediaHeight != null && mediaHeight > 0) {
      setViewBox({ width: mediaWidth, height: mediaHeight });
      return;
    }
    setViewBox({ width: FALLBACK_VIEWBOX_WIDTH, height: FALLBACK_VIEWBOX_HEIGHT });
  }, [canvas.id, mediaWidth, mediaHeight]);

  const imageUrl = canvas.media.fileUrl;

  const pointMarkers = canvas.hotspots
    .filter((hotspot) => {
      // Real polygons own the hit target — never stack a marker on top.
      if (isFillableSvgPath(hotspot.svgPath)) {
        return false;
      }
      // Incomplete polygon drafts must not become a corner (0,0) click target.
      if (hotspot.shapeType === 'polygon') {
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
    .filter((hotspot) => isFillableSvgPath(hotspot.svgPath))
    .map((hotspot) => ({
      id: hotspot.id,
      label: hotspot.label,
      svgPath: hotspot.svgPath as string,
      xPercent: hotspot.xPercent,
      yPercent: hotspot.yPercent,
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

  const useContainedFrame = isContainedStageContext(canvas.contextType);

  return (
    <div className={useContainedFrame ? 'flex w-full justify-center' : 'w-full'}>
      <div
        className={
          useContainedFrame
            ? `relative w-fit max-w-full min-w-0 ${PUBLIC_VISUAL_MAP_CONTAINED_MAX_HEIGHT_CLASS}`
            : 'relative min-w-[280px] w-full'
        }
      >
        <img
          key={canvas.id}
          src={imageUrl}
          alt={canvas.media.altText ?? canvas.title ?? t('alt')}
          className={
            useContainedFrame
              ? `relative z-0 block h-auto w-auto max-w-full select-none ${PUBLIC_VISUAL_MAP_CONTAINED_MAX_HEIGHT_CLASS}`
              : 'relative z-0 h-auto w-full select-none'
          }
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
    </div>
  );
};
