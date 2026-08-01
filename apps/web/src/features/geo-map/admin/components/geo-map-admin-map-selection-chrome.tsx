'use client';

import type { MapLibreMap } from 'maplibre-gl';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { useMapAnchoredScreenPoint } from '@/features/geo-map/hooks/use-map-anchored-screen-point';
import type { GeoMapAdminMapSelectionChromeProps } from '@/features/geo-map/types';
import { Button } from '@/shared/ui/button';

const FLOATING_BAR_OFFSET_PX = 12;

type GeoMapAdminMapSelectionChromeComponentProps = GeoMapAdminMapSelectionChromeProps & {
  map: MapLibreMap | null;
  isMapLoaded: boolean;
};

type ContextMenuState = {
  x: number;
  y: number;
} | null;

const applyScreenPosition = (
  element: HTMLElement | null,
  point: { x: number; y: number } | null,
  offsetY: number,
): void => {
  if (!element || !point) {
    return;
  }
  element.style.left = `${point.x}px`;
  element.style.top = `${point.y + offsetY}px`;
};

/**
 * Map-anchored floating actions + right-click menu for admin OSM / model selection.
 */
export const GeoMapAdminMapSelectionChrome = ({
  map,
  isMapLoaded,
  anchor,
  kind,
  title,
  showAttachProject,
  isDeleting,
  onClearSelection,
  onDeleteModel,
  onFocusCreateUpload,
  onFocusReplaceUpload,
  onFocusAttachProject,
}: GeoMapAdminMapSelectionChromeComponentProps) => {
  const t = useTranslations('Admin.geoMap');
  const screenPoint = useMapAnchoredScreenPoint(map, isMapLoaded, anchor);
  const barRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);

  const closeContextMenu = useCallback((): void => {
    setContextMenu(null);
  }, []);

  useLayoutEffect(() => {
    applyScreenPosition(barRef.current, screenPoint, -FLOATING_BAR_OFFSET_PX);
  }, [screenPoint]);

  useLayoutEffect(() => {
    applyScreenPosition(menuRef.current, contextMenu, 0);
  }, [contextMenu]);

  useEffect(() => {
    if (!map || !kind) {
      return;
    }

    const canvas = map.getCanvas();
    const handleContextMenu = (event: MouseEvent): void => {
      event.preventDefault();
      setContextMenu({ x: event.offsetX, y: event.offsetY });
    };

    canvas.addEventListener('contextmenu', handleContextMenu);
    return () => {
      canvas.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [map, kind]);

  useEffect(() => {
    if (!contextMenu) {
      return;
    }
    const handlePointerDown = (): void => {
      closeContextMenu();
    };
    window.addEventListener('pointerdown', handlePointerDown);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [contextMenu, closeContextMenu]);

  if (!kind || !screenPoint) {
    return null;
  }

  return (
    <>
      <div
        ref={barRef}
        className="pointer-events-none absolute z-20 flex max-w-[min(20rem,calc(100%-1.5rem))] -translate-x-1/2 -translate-y-full flex-wrap items-center gap-2 rounded-sm border border-border bg-surface-elevated/95 px-3 py-2 shadow-sm backdrop-blur-sm"
      >
        <p className="pointer-events-auto min-w-0 flex-1 truncate text-sm font-medium text-ink">
          {title}
        </p>
        {kind === 'osm' ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="pointer-events-auto"
            onClick={onFocusCreateUpload}
          >
            {t('map.actions.placeModel')}
          </Button>
        ) : null}
        {kind === 'model' ? (
          <>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="pointer-events-auto"
              onClick={onFocusReplaceUpload}
            >
              {t('map.actions.replaceGlb')}
            </Button>
            {showAttachProject ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="pointer-events-auto"
                onClick={onFocusAttachProject}
              >
                {t('map.actions.attachProject')}
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant="danger"
              className="pointer-events-auto"
              disabled={isDeleting}
              onClick={onDeleteModel}
            >
              {isDeleting ? t('form.deleting') : t('form.delete')}
            </Button>
          </>
        ) : null}
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="pointer-events-auto"
          onClick={onClearSelection}
        >
          {t('map.deselect')}
        </Button>
      </div>

      {contextMenu ? (
        <div
          ref={menuRef}
          role="menu"
          className="absolute z-30 min-w-[11rem] rounded-sm border border-border bg-surface-elevated py-1 shadow-md"
          onPointerDown={(event) => event.stopPropagation()}
        >
          {kind === 'osm' ? (
            <>
              <ContextMenuItem
                label={t('map.context.placeModel')}
                onSelect={() => {
                  closeContextMenu();
                  onFocusCreateUpload();
                }}
              />
              <ContextMenuItem
                label={t('map.context.clearSelection')}
                onSelect={() => {
                  closeContextMenu();
                  onClearSelection();
                }}
              />
            </>
          ) : (
            <>
              <ContextMenuItem
                label={t('map.context.replaceGlb')}
                onSelect={() => {
                  closeContextMenu();
                  onFocusReplaceUpload();
                }}
              />
              {showAttachProject ? (
                <ContextMenuItem
                  label={t('map.context.attachProject')}
                  onSelect={() => {
                    closeContextMenu();
                    onFocusAttachProject();
                  }}
                />
              ) : null}
              <ContextMenuItem
                label={t('map.context.deleteModel')}
                onSelect={() => {
                  closeContextMenu();
                  onDeleteModel();
                }}
              />
              <ContextMenuItem
                label={t('map.context.deselect')}
                onSelect={() => {
                  closeContextMenu();
                  onClearSelection();
                }}
              />
            </>
          )}
        </div>
      ) : null}
    </>
  );
};

type ContextMenuItemProps = {
  label: string;
  onSelect: () => void;
};

const ContextMenuItem = ({ label, onSelect }: ContextMenuItemProps) => (
  <button
    type="button"
    role="menuitem"
    className="block w-full px-3 py-2 text-left text-sm text-ink hover:bg-surface-muted"
    onClick={onSelect}
  >
    {label}
  </button>
);
