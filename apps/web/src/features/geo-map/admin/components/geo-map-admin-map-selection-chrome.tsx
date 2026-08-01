'use client';

import type { MapLibreMap } from 'maplibre-gl';
import { Link2, RefreshCw, Trash2, Upload, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLayoutEffect, useRef } from 'react';

import { GEO_MAP_UI_OVERLAY_Z_INDEX_CLASS } from '@/features/geo-map/constants';
import { useMapAnchoredScreenPoint } from '@/features/geo-map/hooks/use-map-anchored-screen-point';
import type { GeoMapAdminMapSelectionChromeProps } from '@/features/geo-map/types';
import { IconButton } from '@/shared/ui/icon-button';

const FLOATING_BAR_OFFSET_PX = 56;
const BAR_EDGE_PADDING_PX = 8;
const ICON_CLASS = 'size-4 shrink-0';

type GeoMapAdminMapSelectionChromeComponentProps = GeoMapAdminMapSelectionChromeProps & {
  map: MapLibreMap | null;
  isMapLoaded: boolean;
};

const applyScreenPosition = (
  map: MapLibreMap,
  element: HTMLElement | null,
  point: { x: number; y: number } | null,
  offsetY: number,
): void => {
  if (!element || !point) {
    return;
  }

  const container = map.getContainer();
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;
  const barWidth = element.offsetWidth;
  const barHeight = element.offsetHeight;

  let x = point.x;
  let y = point.y + offsetY;

  const halfWidth = barWidth / 2;
  const minX = halfWidth + BAR_EDGE_PADDING_PX;
  const maxX = containerWidth - halfWidth - BAR_EDGE_PADDING_PX;
  if (maxX >= minX) {
    x = Math.min(Math.max(x, minX), maxX);
  }

  const minY = barHeight + BAR_EDGE_PADDING_PX;
  const maxY = containerHeight - BAR_EDGE_PADDING_PX;
  if (maxY >= minY) {
    y = Math.min(Math.max(y, minY), maxY);
  }

  element.style.left = `${x}px`;
  element.style.top = `${y}px`;
};

/**
 * Map-anchored compact icon toolbar for admin OSM / model selection.
 */
export const GeoMapAdminMapSelectionChrome = ({
  map,
  isMapLoaded,
  anchor,
  kind,
  showAttachProject,
  isDeleting,
  onClearSelection,
  onDeleteModel,
  onHideOsmBuilding,
  onFocusCreateUpload,
  onFocusReplaceUpload,
  onFocusAttachProject,
}: GeoMapAdminMapSelectionChromeComponentProps) => {
  const t = useTranslations('Admin.geoMap');
  const screenPoint = useMapAnchoredScreenPoint(map, isMapLoaded, anchor);
  const barRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!map) {
      return;
    }
    applyScreenPosition(map, barRef.current, screenPoint, -FLOATING_BAR_OFFSET_PX);
  }, [map, screenPoint]);

  if (!kind || !screenPoint) {
    return null;
  }

  return (
    <div
      ref={barRef}
      className={`pointer-events-auto absolute ${GEO_MAP_UI_OVERLAY_Z_INDEX_CLASS} flex -translate-x-1/2 -translate-y-full flex-nowrap items-center gap-0.5 rounded-sm border border-border bg-surface-elevated/95 p-0.5 shadow-sm backdrop-blur-sm`}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      {kind === 'osm' ? (
        <>
          <IconButton
            label={t('map.actions.placeModel')}
            size="sm"
            variant="outline"
            className="size-8 rounded-sm"
            onClick={onFocusCreateUpload}
          >
            <Upload className={ICON_CLASS} strokeWidth={1.75} aria-hidden />
          </IconButton>
          <IconButton
            label={t('map.actions.hideOsm')}
            size="sm"
            variant="outline"
            className="size-8 rounded-sm text-danger hover:bg-danger-soft"
            onClick={onHideOsmBuilding}
          >
            <Trash2 className={ICON_CLASS} strokeWidth={1.75} aria-hidden />
          </IconButton>
        </>
      ) : (
        <>
          <IconButton
            label={t('map.actions.replaceGlb')}
            size="sm"
            variant="outline"
            className="size-8 rounded-sm"
            onClick={onFocusReplaceUpload}
          >
            <RefreshCw className={ICON_CLASS} strokeWidth={1.75} aria-hidden />
          </IconButton>
          {showAttachProject ? (
            <IconButton
              label={t('map.actions.attachProject')}
              size="sm"
              variant="outline"
              className="size-8 rounded-sm"
              onClick={onFocusAttachProject}
            >
              <Link2 className={ICON_CLASS} strokeWidth={1.75} aria-hidden />
            </IconButton>
          ) : null}
          <IconButton
            label={t('map.actions.deleteModel')}
            size="sm"
            variant="outline"
            className="size-8 rounded-sm text-danger hover:bg-danger-soft"
            disabled={isDeleting}
            onClick={onDeleteModel}
          >
            <Trash2 className={ICON_CLASS} strokeWidth={1.75} aria-hidden />
          </IconButton>
        </>
      )}
      <IconButton
        label={t('map.deselect')}
        size="sm"
        variant="outline"
        className="size-8 rounded-sm"
        onClick={onClearSelection}
      >
        <X className={ICON_CLASS} strokeWidth={1.75} aria-hidden />
      </IconButton>
    </div>
  );
};
