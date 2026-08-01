'use client';

import { Link2, RefreshCw, Trash2, Upload, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { GEO_MAP_UI_OVERLAY_Z_INDEX_CLASS } from '@/features/geo-map/constants';
import type { GeoMapAdminMapSelectionChromeProps } from '@/features/geo-map/types';
import { IconButton } from '@/shared/ui/icon-button';

/** Same top as camera controls (`top-2.5 right-2.5`); inset clears the w-7 stack. */
const ADMIN_SELECTION_CHROME_POSITION_CLASS = 'top-2.5 right-14';

const ICON_CLASS = 'size-4 shrink-0';

/**
 * Compact icon toolbar for admin OSM / model selection — pinned top-right on the map overlay.
 */
export const GeoMapAdminMapSelectionChrome = ({
  kind,
  showAttachProject,
  isDeleting,
  onClearSelection,
  onDeleteModel,
  onHideOsmBuilding,
  onFocusCreateUpload,
  onFocusReplaceUpload,
  onFocusAttachProject,
}: GeoMapAdminMapSelectionChromeProps) => {
  const t = useTranslations('Admin.geoMap');

  if (!kind) {
    return null;
  }

  return (
    <div
      className={`pointer-events-auto absolute ${ADMIN_SELECTION_CHROME_POSITION_CLASS} ${GEO_MAP_UI_OVERLAY_Z_INDEX_CLASS} flex flex-nowrap items-center gap-0.5 rounded-sm border border-border bg-surface-elevated/95 p-0.5 shadow-sm backdrop-blur-sm`}
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
